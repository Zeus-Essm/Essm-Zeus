export function toast(msg: string) {
  if ((window as any).Capacitor) {
    // No futuro, aqui pode ser chamado o plugin Toast do Capacitor
    console.log("TOAST:", msg);
  } else {
    alert(msg);
  }
}