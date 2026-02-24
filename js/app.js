/* ============================================
   BLINKENLIGHTS - LED Controller
   ============================================ */

class LEDController {
    constructor() {
        this.leds = [];
    }

    register(element) {
        const type = element.dataset.type;
        const color = element.dataset.color;
        this.leds.push({ element, type, color });
    }

    start() {
        this.leds.forEach(led => {
            switch (led.type) {
                case 'power':
                    this.runPowerLED(led);
                    break;
                case 'activity':
                    this.runActivityLED(led);
                    break;
                case 'tape':
                    this.runTapeLED(led);
                    break;
            }
        });
    }

    turnOn(led) {
        led.element.classList.add('led--on');
    }

    turnOff(led) {
        led.element.classList.remove('led--on');
    }

    // Power LED: always on with rare brief flickers
    runPowerLED(led) {
        this.turnOn(led);
        const flicker = () => {
            const nextFlicker = 8000 + Math.random() * 12000;
            setTimeout(() => {
                this.turnOff(led);
                setTimeout(() => {
                    this.turnOn(led);
                    flicker();
                }, 40 + Math.random() * 80);
            }, nextFlicker);
        };
        flicker();
    }

    // Activity LED: simulates disk drive access with random bursts
    runActivityLED(led) {
        // Stagger start time so dual 1571 drives don't sync perfectly
        const initialDelay = Math.random() * 3000;
        setTimeout(() => {
            const cycle = () => {
                const idleTime = 1500 + Math.random() * 4000;
                setTimeout(() => {
                    const burstCount = 4 + Math.floor(Math.random() * 18);
                    this.runBurst(led, burstCount, () => {
                        if (Math.random() > 0.6) {
                            setTimeout(() => {
                                const burstCount2 = 3 + Math.floor(Math.random() * 10);
                                this.runBurst(led, burstCount2, cycle);
                            }, 200 + Math.random() * 400);
                        } else {
                            cycle();
                        }
                    });
                }, idleTime);
            };
            cycle();
        }, initialDelay);
    }

    // Tape LED: simulates cassette loading with rhythmic patterns
    runTapeLED(led) {
        const cycle = () => {
            const headerDuration = 1500 + Math.random() * 1500;
            this.runSteadyBlink(led, 120, 120, headerDuration, () => {
                setTimeout(() => {
                    const dataCount = 12 + Math.floor(Math.random() * 20);
                    this.runBurst(led, dataCount, () => {
                        setTimeout(() => {
                            if (Math.random() > 0.3) {
                                const dataCount2 = 8 + Math.floor(Math.random() * 15);
                                this.runBurst(led, dataCount2, () => {
                                    setTimeout(cycle, 2000 + Math.random() * 3000);
                                });
                            } else {
                                setTimeout(cycle, 1500 + Math.random() * 2000);
                            }
                        }, 300 + Math.random() * 500);
                    });
                }, 200 + Math.random() * 300);
            });
        };
        cycle();
    }

    // Burst: rapid on/off blinks with random timing
    runBurst(led, count, callback) {
        if (count <= 0) {
            this.turnOff(led);
            if (callback) callback();
            return;
        }
        this.turnOn(led);
        const onTime = 30 + Math.random() * 130;
        setTimeout(() => {
            this.turnOff(led);
            const offTime = 20 + Math.random() * 90;
            setTimeout(() => {
                this.runBurst(led, count - 1, callback);
            }, offTime);
        }, onTime);
    }

    // Steady blink: regular on/off for a duration
    runSteadyBlink(led, onMs, offMs, duration, callback) {
        const startTime = Date.now();
        const blink = () => {
            if (Date.now() - startTime >= duration) {
                this.turnOff(led);
                if (callback) callback();
                return;
            }
            this.turnOn(led);
            setTimeout(() => {
                this.turnOff(led);
                setTimeout(blink, offMs + (Math.random() * 20 - 10));
            }, onMs + (Math.random() * 20 - 10));
        };
        blink();
    }
}

/* ============================================
   BBS TERMINAL - Metaverso BBS Simulator
   Inspired by QSD, PCBoard and 80s Latin BBS
   ============================================ */

class BBSTerminal {
    constructor(element) {
        this.screen = element;
        this.content = '';
        this.maxLines = 17;

        // Build DOM: text node + cursor span
        this.textNode = document.createTextNode('');
        this.cursorEl = document.createElement('span');
        this.cursorEl.className = 'bbs-cursor';
        this.cursorEl.textContent = '\u00a0'; // non-breaking space as block cursor
        this.screen.appendChild(this.textNode);
        this.screen.appendChild(this.cursorEl);
    }

    render() {
        // Keep only the last maxLines lines (terminal scroll effect)
        const lines = this.content.split('\n');
        if (lines.length > this.maxLines) {
            this.content = lines.slice(lines.length - this.maxLines).join('\n');
        }
        this.textNode.textContent = this.content;
    }

    wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async type(text, delay = 22) {
        for (const ch of text) {
            this.content += ch;
            this.render();
            // Only delay on printable non-space characters for speed
            if (ch !== ' ' && ch !== '\n') {
                await this.wait(delay + Math.random() * delay * 0.4);
            }
        }
    }

    clear() {
        this.content = '';
        this.render();
    }

    async start() {
        await this.wait(800);
        while (true) {
            await this.runCycle();
        }
    }

    async runCycle() {

        // ── SCREEN 1: Welcome ────────────────────────────────
        this.clear();
        await this.wait(300);
        await this.type('================================\n', 4);
        await this.type('   M E T A V E R S O  B B S   \n', 16);
        await this.type('   v2.1  *  Nodo 1/4  * 14400  \n', 10);
        await this.type('================================\n', 4);
        await this.type('\n');
        await this.type('Bienvenido, SYSOP!\n', 28);
        await this.type('Ultima conn: Hoy 14:32 hs\n', 20);
        await this.type('Mensajes nuevos: 7\n', 20);
        await this.type('\n');
        await this.type('[M]ensajes   [F]icheros\n', 16);
        await this.type('[C]hat       [G]ames\n', 16);
        await this.type('[B]oards     [?]Ayuda\n', 16);
        await this.type('[Q]uit\n\n', 16);
        await this.type('Seleccion: ', 26);
        await this.wait(2400);
        await this.type('M\n', 40);
        await this.wait(500);

        // ── SCREEN 2: Message areas ──────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('-- AREAS DE MENSAJES --\n\n', 10);
        await this.type('1. General        [247 msgs]\n', 16);
        await this.type('2. Tecnologia     [189 msgs]\n', 16);
        await this.type('3. Juegos         [312 msgs]\n', 16);
        await this.type('4. Programacion   [ 98 msgs]\n', 16);
        await this.type('5. Humor & Ocio   [421 msgs]\n', 16);
        await this.type('6. Warez/Demos    [ 67 msgs]\n', 16);
        await this.type('\nArea [INTRO=todos]: ', 20);
        await this.wait(1900);
        await this.type('3\n', 40);
        await this.wait(500);

        // ── SCREEN 3: Game messages ──────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('JUEGOS - Mensajes nuevos\n', 10);
        await this.type('------------------------\n', 4);
        await this.type('De:    Pirata_80\n', 20);
        await this.type('Para:  TODOS\n', 20);
        await this.type('Fecha: 23/02/88 22:14\n', 20);
        await this.type('Asunto: Space Wars - nivel 7\n\n', 20);
        await this.type('Gente, descubri el truco del\n', 20);
        await this.type('nivel 7: hay que esperar al\n', 20);
        await this.type('enemigo en la esquina izq y\n', 20);
        await this.type('disparar cuando gira...\n', 20);
        await this.wait(2800);
        await this.type('\n[INTRO] siguiente msg: ', 20);
        await this.wait(2000);
        await this.type('\n');
        await this.wait(500);

        // ── SCREEN 4: Go to Files ────────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('Seleccion: ', 26);
        await this.wait(1300);
        await this.type('F\n', 40);
        await this.wait(500);

        this.clear();
        await this.wait(200);
        await this.type('-- FICHEROS DISPONIBLES --\n\n', 10);
        await this.type('[A] Aplicaciones\n', 16);
        await this.type('[J] Juegos         NEW!\n', 16);
        await this.type('[D] Demos/Intros\n', 16);
        await this.type('[M] Musica MOD\n', 16);
        await this.type('[U] Subir fichero\n', 16);
        await this.type('\nSeccion: ', 22);
        await this.wait(1600);
        await this.type('J\n', 40);
        await this.wait(500);

        // ── SCREEN 5: File list ──────────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('JUEGOS - 14 ficheros\n', 10);
        await this.type('--------------------\n', 4);
        await this.type('ZORK3.ZIP     192K  Zork III\n', 16);
        await this.type('MANMINE.ZIP   48K   Manic Miner\n', 16);
        await this.type('ELITE.ZIP     112K  Elite C64\n', 16);
        await this.type('PITFALL.ZIP   34K   Pitfall II\n', 16);
        await this.type('\nDescargar [nombre/Q]: ', 22);
        await this.wait(2000);
        await this.type('Q\n', 40);
        await this.wait(500);

        // ── SCREEN 6: Bulletins ──────────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('Seleccion: ', 26);
        await this.wait(1200);
        await this.type('B\n', 40);
        await this.wait(500);

        this.clear();
        await this.wait(200);
        await this.type('-- TABLON DE ANUNCIOS --\n\n', 10);
        await this.type('* MAINT: Sabado 03:00-06:00\n', 16);
        await this.type('* NUEVO: Area de Demos!\n', 16);
        await this.type('* TOP10 mensual activo\n', 16);
        await this.type('* Chat grupal: mierc 22hs\n', 16);
        await this.type('* Nuevo nodo 4 operativo!\n', 16);
        await this.type('\n[INTRO] para continuar: ', 22);
        await this.wait(2600);
        await this.type('\n');
        await this.wait(600);

        // ── SCREEN 7: Goodbye ────────────────────────────────
        this.clear();
        await this.wait(200);
        await this.type('Seleccion: ', 26);
        await this.wait(1200);
        await this.type('Q\n\n', 40);
        await this.wait(300);
        await this.type('Gracias por llamar a\n', 22);
        await this.type('METAVERSO BBS!\n\n', 16);
        await this.type('Hasta la proxima, SYSOP.\n', 22);
        await this.type('Desconectando...\n', 20);
        await this.wait(2200);
        // Loop back
    }
}

/* ============================================
   INITIALIZE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // LED controller
    const controller = new LEDController();
    document.querySelectorAll('.led').forEach(el => {
        controller.register(el);
    });
    controller.start();

    // BBS terminal
    const bbsEl = document.getElementById('bbs-screen');
    if (bbsEl) {
        const terminal = new BBSTerminal(bbsEl);
        terminal.start();
    }
});
