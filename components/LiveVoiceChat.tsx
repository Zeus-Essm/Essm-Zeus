import React, { useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';

// Base64 encoding/decoding functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


interface LiveVoiceChatProps {
  onNewTranscriptionTurn: (turn: { userInput: string, modelOutput: string }) => void;
  onStatusChange: (status: 'connecting' | 'connected' | 'error' | 'closed') => void;
  onError: (errorMessage: string) => void;
}

const LiveVoiceChat: React.FC<LiveVoiceChatProps> = ({ onNewTranscriptionTurn, onStatusChange, onError }) => {
  const sessionRef = useRef<LiveSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  useEffect(() => {
    if (!process.env.API_KEY) {
        onError("API_KEY do Gemini não está configurada.");
        onStatusChange('error');
        return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let localSessionPromise: Promise<LiveSession> | null = null;
    let localInputAudioContext: AudioContext | null = null;
    let localOutputAudioContext: AudioContext | null = null;
    let localMediaStream: MediaStream | null = null;
    let localScriptProcessor: ScriptProcessorNode | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    
    const cleanup = () => {
        onStatusChange('closed');
        localSessionPromise?.then(session => session.close());
        localMediaStream?.getTracks().forEach(track => track.stop());
        if (localScriptProcessor) {
          localScriptProcessor.onaudioprocess = null;
          localScriptProcessor.disconnect();
        }
        sourceNode?.disconnect();
        localInputAudioContext?.close().catch(console.error);
        localOutputAudioContext?.close().catch(console.error);

        sessionRef.current = null;
        mediaStreamRef.current = null;
        audioProcessorRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
    };
    
    const setup = async () => {
        try {
            onStatusChange('connecting');
            // FIX: Cast window to `any` to allow access to the legacy `webkitAudioContext` for older Safari browser compatibility.
            localInputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = localInputAudioContext;
            // FIX: Cast window to `any` to allow access to the legacy `webkitAudioContext` for older Safari browser compatibility.
            localOutputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = localOutputAudioContext;
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        onStatusChange('connected');
                        try {
                           localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                           mediaStreamRef.current = localMediaStream;
                           sourceNode = localInputAudioContext!.createMediaStreamSource(localMediaStream);
                           localScriptProcessor = localInputAudioContext!.createScriptProcessor(4096, 1, 1);
                           audioProcessorRef.current = localScriptProcessor;
                           
                           localScriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                localSessionPromise?.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                           };
                           
                           sourceNode.connect(localScriptProcessor);
                           localScriptProcessor.connect(localInputAudioContext!.destination);

                        } catch (err) {
                            console.error('Error in onopen while getting user media:', err);
                            onError('Falha ao acessar o microfone.');
                            onStatusChange('error');
                            cleanup();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.current;
                            const fullOutput = currentOutputTranscription.current;
                            if (fullInput.trim() || fullOutput.trim()) {
                                onNewTranscriptionTurn({ userInput: fullInput, modelOutput: fullOutput });
                            }
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && localOutputAudioContext) {
                            const nextStartTime = Math.max(
                                nextStartTimeRef.current,
                                localOutputAudioContext.currentTime,
                            );
                            nextStartTimeRef.current = nextStartTime;

                            const audioBuffer = await decodeAudioData(decode(base64Audio), localOutputAudioContext, 24000, 1);
                            
                            const source = localOutputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(localOutputAudioContext.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                            });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live API error:', e);
                        onError(`Erro na conexão: ${e.message}`);
                        onStatusChange('error');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        onStatusChange('closed');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'Você é um assistente de moda amigável e prestativo no aplicativo PUMP. Seja conciso e envolvente.',
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            localSessionPromise = sessionPromise;
            sessionRef.current = await sessionPromise;
        } catch (err: any) {
            console.error('Error setting up Live API:', err);
            onError(`Falha ao iniciar o chat de voz: ${err.message}`);
            onStatusChange('error');
            cleanup();
        }
    };

    setup();
    
    return () => {
        cleanup();
    };
}, [onNewTranscriptionTurn, onStatusChange, onError]);

  return null;
};

export default LiveVoiceChat;
