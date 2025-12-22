export function toast(msg: string) {
  if ((window as any).Capacitor) {
    console.log("TOAST:", msg);
  } else {
    alert(msg);
  }
}

toast.success = (msg: string) => {
  toast(`✅ ${msg}`);
};

toast.error = (msg: string) => {
  toast(`❌ ${msg}`);
};