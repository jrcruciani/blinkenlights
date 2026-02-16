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
        const cycle = () => {
            // Idle period
            const idleTime = 1500 + Math.random() * 4000;
            setTimeout(() => {
                // Activity burst
                const burstCount = 4 + Math.floor(Math.random() * 18);
                this.runBurst(led, burstCount, () => {
                    // Sometimes do a double burst
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
    }

    // Tape LED: simulates cassette loading with rhythmic patterns
    runTapeLED(led) {
        const cycle = () => {
            // Header phase: steady rapid blinking (pilot tone)
            const headerDuration = 1500 + Math.random() * 1500;
            this.runSteadyBlink(led, 120, 120, headerDuration, () => {
                // Brief gap
                setTimeout(() => {
                    // Data phase: irregular bursts
                    const dataCount = 12 + Math.floor(Math.random() * 20);
                    this.runBurst(led, dataCount, () => {
                        // Gap between blocks
                        setTimeout(() => {
                            // Second data block
                            if (Math.random() > 0.3) {
                                const dataCount2 = 8 + Math.floor(Math.random() * 15);
                                this.runBurst(led, dataCount2, () => {
                                    // Longer pause before next load
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const controller = new LEDController();

    document.querySelectorAll('.led').forEach(el => {
        controller.register(el);
    });

    controller.start();
});
