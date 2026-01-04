// Simple live reload: poll every 2 seconds
let lastModified = Date.now();
setInterval(async () => {
  try {
    const res = await fetch('/reload-check');
    const { modified } = await res.json();
    if (modified > lastModified) {
      location.reload();
    }
  } catch(e) {}
}, 2000);
