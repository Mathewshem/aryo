"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, ZoomIn } from "lucide-react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { api } from "./api";
import { toast } from "./dialogs";

// Circular profile-photo uploader: pick → position/zoom inside a circle → upload a 600px square.
export default function PhotoPicker({ value, onChange, name, folder = "talent", shape = "circle", size = 96, compact = false }) {
  const input = useRef(null);
  const [src, setSrc] = useState(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const drag = useRef(null);
  const BOX = 280;

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) return toast("Choose an image file", "bad");
    if (f.type === "image/svg+xml") return upload(f); // logos: keep vector as-is
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => { setImg(im); setSrc(url); setZoom(1); setOff({ x: 0, y: 0 }); };
    im.src = url;
  };

  const base = img ? BOX / Math.min(img.width, img.height) : 1;
  const clamp = (o, z) => {
    if (!img) return o;
    const w = img.width * base * z, h = img.height * base * z;
    const mx = Math.max(0, (w - BOX) / 2), my = Math.max(0, (h - BOX) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  };

  async function upload(fileOrBlob, type) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", fileOrBlob, type ? "photo.jpg" : fileOrBlob.name);
      fd.append("folder", folder);
      const { url } = await api("/api/admin/upload", { method: "POST", body: fd });
      onChange(url);
      setSrc(null); setImg(null);
      toast("Photo uploaded");
    } catch (e) { toast(e.message, "bad"); } finally { setBusy(false); }
  }

  const save = () => {
    const OUT = 600, k = OUT / BOX;
    const c = document.createElement("canvas");
    c.width = c.height = OUT;
    const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, OUT, OUT);
    const w = img.width * base * zoom * k, h = img.height * base * zoom * k;
    g.drawImage(img, OUT / 2 - w / 2 + off.x * k, OUT / 2 - h / 2 + off.y * k, w, h);
    c.toBlob((b) => upload(b, "image/jpeg"), "image/jpeg", 0.88);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group" style={{ width: size, height: size }}>
        {shape === "circle" ? <Avatar src={value} name={name} size={size} ring /> : (
          <div className="w-full h-full rounded-md border b-line bg-surface-2 grid place-items-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {value ? <img src={value} alt="" className="w-full h-full object-contain p-2" /> : <Camera size={20} className="t-faint" />}
          </div>
        )}
        <button type="button" onClick={() => input.current.click()} disabled={busy}
          className={`absolute inset-0 grid place-items-center ${shape === "circle" ? "rounded-full" : "rounded-md"} bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
        </button>
      </div>
      {!compact && <div className="flex flex-col gap-1.5">
        <button type="button" className="btn btn-ghost" onClick={() => input.current.click()} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {value ? "Change photo" : "Upload photo"}
        </button>
        {value && <button type="button" className="btn btn-ghost" style={{ color: "var(--bad)" }} onClick={() => onChange(null)}><Trash2 size={14} /> Remove</button>}
        <span className="text-[10.5px] t-faint">JPG, PNG or WEBP · max 5 MB</span>
      </div>}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" hidden onChange={pick} />

      <Modal open={!!src} onClose={() => { setSrc(null); setImg(null); }} title="Position photo" subtitle="Drag to move, use the slider to zoom" icon={<Camera size={15} />} width={380}
        footer={<><button className="btn btn-ghost" onClick={() => { setSrc(null); setImg(null); }}>Cancel</button>
          <button className="btn btn-gold" onClick={save} disabled={busy}>{busy && <Loader2 size={14} className="animate-spin" />} Save photo</button></>}>
        {img && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative overflow-hidden bg-black touch-none cursor-grab active:cursor-grabbing select-none"
              style={{ width: BOX, height: BOX, borderRadius: shape === "circle" ? "50%" : 8, boxShadow: "0 0 0 3px var(--gold)" }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX - off.x, y: e.clientY - off.y }; }}
              onPointerMove={(e) => drag.current && setOff(clamp({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }, zoom))}
              onPointerUp={() => (drag.current = null)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} className="absolute max-w-none pointer-events-none"
                style={{ width: img.width * base * zoom, height: img.height * base * zoom, left: BOX / 2 - (img.width * base * zoom) / 2 + off.x, top: BOX / 2 - (img.height * base * zoom) / 2 + off.y }} />
            </div>
            <label className="flex items-center gap-3 w-full">
              <ZoomIn size={15} className="t-muted" />
              <input type="range" min="1" max="3" step="0.01" value={zoom} className="flex-1 accent-[var(--gold)]"
                onChange={(e) => { const z = +e.target.value; setZoom(z); setOff((o) => clamp(o, z)); }} />
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
