export class ConfettiCannon {
    canvas;
    ctx;
    particles = [];
    animId = null;
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = this.canvas.clientWidth || window.innerWidth;
        this.canvas.height = this.canvas.clientHeight || window.innerHeight;
    }
    burst(count = 80) {
        this.resize();
        const colors = ['#FF4B72', '#3388FF', '#FF9900', '#2ECC71', '#F1C40F', '#9B59B6', '#FF8A80'];
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height * 0.4;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 5 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                opacity: 1,
            });
        }
        if (!this.animId) {
            this.loop();
        }
    }
    loop = () => {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // gravity
            p.vx *= 0.98;
            p.rotation += p.vRot;
            p.opacity -= 0.012;
            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            this.ctx.restore();
        }
        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(this.loop);
        }
        else {
            this.animId = null;
        }
    };
}
