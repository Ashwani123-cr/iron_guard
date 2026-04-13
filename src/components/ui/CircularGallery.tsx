import { useEffect, useRef, useCallback } from "react";
import "./CircularGallery.css";

interface GalleryItem {
  image: string;
  text: string;
  description?: string;
  icon?: string; // "shield" | "lock" | "eye" | "zap" | "cloud" | "brain" | "network" | "cpu"
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontSize?: number;
}

const CircularGallery = ({
  items = [],
  bend = 4,
  textColor = "#ffffff",
  borderRadius = 0.08,
  font = "bold 24px 'Space Grotesk', monospace",
  fontSize = 24,
}: CircularGalleryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const scrollRef = useRef({ offset: 0, target: 0, velocity: 0 });
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, lastX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const cardW = 260;
  const cardH = 340;
  const gap = cardW + 40;
  const totalWidth = items.length * gap;

  const drawCard = useCallback((
    ctx: CanvasRenderingContext2D,
    item: GalleryItem,
    x: number,
    y: number,
    scale: number,
    alpha: number,
    time: number
  ) => {
    ctx.save();
    ctx.globalAlpha = Math.max(alpha, 0.15);
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const w = cardW;
    const h = cardH;
    const r = borderRadius * w;
    const hx = -w / 2;
    const hy = -h / 2;

    // Card background
    const grad = ctx.createLinearGradient(hx, hy, hx, hy + h);
    grad.addColorStop(0, "rgba(12, 15, 35, 0.95)");
    grad.addColorStop(0.5, "rgba(8, 10, 25, 0.97)");
    grad.addColorStop(1, "rgba(4, 5, 15, 0.99)");

    // Rounded rect path
    ctx.beginPath();
    ctx.moveTo(hx + r, hy);
    ctx.lineTo(hx + w - r, hy);
    ctx.quadraticCurveTo(hx + w, hy, hx + w, hy + r);
    ctx.lineTo(hx + w, hy + h - r);
    ctx.quadraticCurveTo(hx + w, hy + h, hx + w - r, hy + h);
    ctx.lineTo(hx + r, hy + h);
    ctx.quadraticCurveTo(hx, hy + h, hx, hy + h - r);
    ctx.lineTo(hx, hy + r);
    ctx.quadraticCurveTo(hx, hy, hx + r, hy);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Border glow with animated pulse
    const glowPulse = 0.15 + Math.sin(time * 2) * 0.08;
    ctx.strokeStyle = `rgba(125, 249, 255, ${glowPulse})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top glow line
    const topGlow = ctx.createLinearGradient(hx, 0, hx + w, 0);
    topGlow.addColorStop(0, "rgba(125, 249, 255, 0)");
    topGlow.addColorStop(0.3, `rgba(125, 249, 255, ${0.3 + Math.sin(time * 3) * 0.15})`);
    topGlow.addColorStop(0.7, `rgba(125, 249, 255, ${0.3 + Math.sin(time * 3 + 1) * 0.15})`);
    topGlow.addColorStop(1, "rgba(125, 249, 255, 0)");
    ctx.strokeStyle = topGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + r, hy + 1);
    ctx.lineTo(hx + w - r, hy + 1);
    ctx.stroke();

    // Accent bar
    ctx.fillStyle = `rgba(125, 249, 255, ${0.08 + Math.sin(time) * 0.04})`;
    ctx.fillRect(hx, hy, w, 3);

    // Icon area
    const iconY = hy + h * 0.22;
    const iconR = 36;

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, iconY, iconR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(125, 249, 255, ${0.06 + Math.sin(time * 1.5) * 0.03})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, iconY, iconR, 0, Math.PI * 2);
    const iconGrad = ctx.createRadialGradient(0, iconY, 0, 0, iconY, iconR);
    iconGrad.addColorStop(0, "rgba(125, 249, 255, 0.12)");
    iconGrad.addColorStop(1, "rgba(125, 249, 255, 0.02)");
    ctx.fillStyle = iconGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(125, 249, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw unique icon based on item.icon
    ctx.strokeStyle = "rgba(125, 249, 255, 0.7)";
    ctx.fillStyle = "rgba(125, 249, 255, 0.06)";
    ctx.lineWidth = 1.8;
    const iconType = item.icon || "shield";

    ctx.save();
    ctx.translate(0, iconY);

    if (iconType === "shield") {
      // Shield with checkmark
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(14, -9); ctx.lineTo(14, 5);
      ctx.quadraticCurveTo(14, 14, 0, 18);
      ctx.quadraticCurveTo(-14, 14, -14, 5); ctx.lineTo(-14, -9);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, 2); ctx.lineTo(-1, 7); ctx.lineTo(8, -4);
      ctx.strokeStyle = "rgba(125, 249, 255, 0.9)"; ctx.lineWidth = 2; ctx.stroke();
    } else if (iconType === "lock") {
      // Padlock
      ctx.beginPath(); ctx.arc(0, -6, 8, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = "rgba(125, 249, 255, 0.08)";
      ctx.fillRect(-10, -2, 20, 16); ctx.strokeRect(-10, -2, 20, 16);
      ctx.beginPath(); ctx.arc(0, 6, 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(125, 249, 255, 0.9)"; ctx.stroke();
    } else if (iconType === "eye") {
      // Eye
      ctx.beginPath(); ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(-8, -12, 0, -12); ctx.quadraticCurveTo(8, -12, 16, 0);
      ctx.quadraticCurveTo(8, 12, 0, 12); ctx.quadraticCurveTo(-8, 12, -16, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(125, 249, 255, 0.9)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125, 249, 255, 0.7)"; ctx.fill();
    } else if (iconType === "zap") {
      // Lightning bolt
      ctx.beginPath(); ctx.moveTo(2, -16); ctx.lineTo(-6, -2); ctx.lineTo(0, -2);
      ctx.lineTo(-2, 16); ctx.lineTo(8, 2); ctx.lineTo(2, 2); ctx.closePath();
      ctx.fillStyle = "rgba(125, 249, 255, 0.15)"; ctx.fill(); ctx.stroke();
    } else if (iconType === "cloud") {
      // Cloud
      ctx.beginPath();
      ctx.arc(-6, 2, 10, Math.PI * 0.7, Math.PI * 1.9); 
      ctx.arc(6, -2, 12, Math.PI * 1.1, Math.PI * 0.4);
      ctx.arc(4, 6, 8, Math.PI * 1.8, Math.PI * 0.8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (iconType === "brain") {
      // Brain (simplified)
      ctx.beginPath(); ctx.arc(-5, -4, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, -4, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-3, 6, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(5, 6, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12);
      ctx.strokeStyle = "rgba(125, 249, 255, 0.4)"; ctx.stroke();
    } else if (iconType === "network") {
      // Network nodes
      const nodes = [[-10,-10],[10,-10],[0,0],[-10,10],[10,10]];
      ctx.strokeStyle = "rgba(125, 249, 255, 0.3)";
      for (let ni = 0; ni < nodes.length; ni++) {
        for (let nj = ni+1; nj < nodes.length; nj++) {
          ctx.beginPath(); ctx.moveTo(nodes[ni][0], nodes[ni][1]);
          ctx.lineTo(nodes[nj][0], nodes[nj][1]); ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(125, 249, 255, 0.7)";
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n[0], n[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(125, 249, 255, 0.3)"; ctx.fill(); ctx.stroke();
      });
    } else if (iconType === "cpu") {
      // CPU chip
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.fillStyle = "rgba(125, 249, 255, 0.08)"; ctx.fillRect(-10, -10, 20, 20);
      // Pins
      for (let p = -6; p <= 6; p += 4) {
        ctx.beginPath(); ctx.moveTo(p, -10); ctx.lineTo(p, -15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p, 10); ctx.lineTo(p, 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, p); ctx.lineTo(-15, p); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, p); ctx.lineTo(15, p); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(125, 249, 255, 0.9)"; ctx.stroke();
    }

    ctx.restore();

    // Active indicator
    ctx.beginPath();
    ctx.arc(hx + w - 25, hy + 20, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(74, 222, 128, ${0.6 + Math.sin(time * 4) * 0.3})`;
    ctx.fill();

    ctx.font = "bold 9px 'Space Grotesk', monospace";
    ctx.fillStyle = "rgba(74, 222, 128, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText("ACTIVE", hx + w - 35, hy + 23);

    // Title
    ctx.font = font;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxW = w - 40;
    const words = item.text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);

    const lh = fontSize * 1.3;
    const titleY = hy + h * 0.45;
    lines.forEach((l, i) => {
      ctx.fillText(l, 0, titleY + i * lh - ((lines.length - 1) * lh) / 2);
    });

    // Separator
    const sepY = hy + h * 0.55;
    const sepGrad = ctx.createLinearGradient(hx + w * 0.15, 0, hx + w * 0.85, 0);
    sepGrad.addColorStop(0, "rgba(125, 249, 255, 0)");
    sepGrad.addColorStop(0.5, "rgba(125, 249, 255, 0.2)");
    sepGrad.addColorStop(1, "rgba(125, 249, 255, 0)");
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx + w * 0.15, sepY);
    ctx.lineTo(hx + w * 0.85, sepY);
    ctx.stroke();

    // Description
    if (item.description) {
      ctx.font = "13px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      const dWords = item.description.split(" ");
      const dLines: string[] = [];
      let dLine = "";
      for (const dw of dWords) {
        const dt = dLine ? dLine + " " + dw : dw;
        if (ctx.measureText(dt).width > maxW - 10 && dLine) {
          dLines.push(dLine);
          dLine = dw;
        } else {
          dLine = dt;
        }
      }
      if (dLine) dLines.push(dLine);
      dLines.slice(0, 3).forEach((dl, di) => {
        ctx.fillText(dl, 0, hy + h * 0.62 + di * 16);
      });
    }

    // Bottom stats
    ctx.font = "bold 9px 'Space Grotesk', monospace";
    ctx.fillStyle = "rgba(125, 249, 255, 0.4)";
    ctx.textAlign = "left";
    ctx.fillText("THREAT LEVEL", hx + 18, hy + h * 0.88);
    ctx.fillStyle = "rgba(74, 222, 128, 0.6)";
    ctx.textAlign = "right";
    ctx.fillText("PROTECTED", hx + w - 18, hy + h * 0.88);

    // Bottom label
    ctx.font = "10px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.fillText("IronGuard Security Layer", 0, hy + h * 0.95);

    // Scanline overlay
    ctx.globalAlpha *= 0.04;
    for (let sy = hy; sy < hy + h; sy += 4) {
      ctx.fillStyle = "rgba(125, 249, 255, 1)";
      ctx.fillRect(hx, sy, w, 1);
    }

    ctx.restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borderRadius, font, fontSize, textColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || items.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const baseSpeed = 0.5;
    let autoSpeed = baseSpeed;
    let scrollPos = 0;
    let dragOffset = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartOffset = 0;
    let dragVelocity = 0;
    let lastDragX = 0;
    let lastPageScrollY = window.scrollY;

    // Listen to page scroll direction to control card movement direction
    const onPageScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastPageScrollY) {
        // Scrolling down → cards move right to left (normal)
        autoSpeed = baseSpeed;
      } else if (currentY < lastPageScrollY) {
        // Scrolling up → cards move left to right (reverse)
        autoSpeed = -baseSpeed;
      }
      lastPageScrollY = currentY;
    };

    window.addEventListener("scroll", onPageScroll, { passive: true });

    // Click + drag/swipe
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartOffset = dragOffset;
      lastDragX = e.clientX;
      dragVelocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      dragOffset = dragStartOffset - (e.clientX - dragStartX) * 1.5;
      dragVelocity = e.clientX - lastDragX;
      lastDragX = e.clientX;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      dragOffset -= dragVelocity * 5;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);

    const render = () => {
      time += 0.016;

      // Auto-scroll continuously in current direction
      scrollPos += autoSpeed;

      // Decay drag offset back to 0 smoothly
      if (!isDragging) {
        dragOffset *= 0.95;
      }

      // Final position = auto + drag/swipe offset
      const finalOffset = scrollPos + dragOffset;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;

      const cards: { item: GalleryItem; x: number; y: number; scale: number; alpha: number }[] = [];

      // How many card slots needed to fill screen
      const slotsNeeded = Math.ceil(width / gap) + 4;
      // Starting slot index based on scroll position
      const startSlot = Math.floor((finalOffset - width / 2) / gap) - 1;

      for (let s = startSlot; s < startSlot + slotsNeeded; s++) {
        const itemIdx = ((s % items.length) + items.length) % items.length;
        const posX = s * gap - finalOffset;
        const screenX = centerX + posX;

        if (screenX < -cardW || screenX > width + cardW) continue;

        const norm = posX / (width / 2);
        const curveY = Math.pow(Math.abs(norm), 1.4) * 100;
        const scale = 1.0 - Math.abs(norm) * 0.08;
        const alpha = 1.0 - Math.abs(norm) * 0.3;

        cards.push({
          item: items[itemIdx],
          x: screenX,
          y: centerY + curveY,
          scale: Math.max(scale, 0.6),
          alpha: Math.max(alpha, 0.15),
        });
      }

      // Sort by scale so center cards render on top
      cards.sort((a, b) => a.scale - b.scale);

      for (const card of cards) {
        drawCard(ctx, card.item, card.x, card.y, card.scale, card.alpha, time);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onPageScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, bend]);

  return (
    <div ref={containerRef} className="circular-gallery" data-lenis-prevent>
      <canvas ref={canvasRef} style={{ touchAction: 'none' }} />
    </div>
  );
};

export default CircularGallery;
