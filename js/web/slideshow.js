import app from "../app.js";
import { hooks } from "../lib/hooks.js";
import popup from "./popup.js";
const slides = [
    ['next', 'temples1.gif', 'slide-zoom', 8, 'it is a dark age of magic...'] // and <x>cultural decline...</x>
    ,
    ['next', 'king1.gif', 'slide-zoom', 8, 'the king has ordered its court to <x>research necromancy</x> while also <x>banning magic</x> and <x>promoting paganism...</x>']
    // , ['only', 'paladins.gif', 'slide-bottom', 5, 'its paladins, healers and temples are allowed to cast spells']
    //, ['next', 'exiles2.gif', 'slide-bottom', 5, 'commoners are exiled']
    //, ['next', 'grimoire.gif', 'slide-left', 5, 'grimoires are destroyed']
    // , ['next', 'siege3.gif', 'slide-bottom', 4, 'holds turn into factions']
    ,
    ['next', 'castle1.gif', 'slide-bottom', 8, 'holds who <x>rely on magic</x> to defend borders <x>turn into factions</x>'],
    ['next', 'arguing1.gif', 'slide-zoom', 5, 'a gathering of <x>wizards</x> hold council and call for peace'],
    ['keep', '', 'slide-zoom', 5, 'and at their insistence the king stands down...']
    //, ['next', 'defeat2.gif', 'slide-bottom', 6, 'but contained within him was a dark corruption...']
    ,
    ['next', 'wanderer6.gif', 'slide-shadow-king', 5, 'becoming a shadow...'],
    ['keep', '', 'slide-bottom', 5, 'leaving corruption in his wake...'],
    ['next', 'book2.gif', 'slide-bottom', 8, 'magic was <x>free again</x> but remained an obscure subject...']
    // , ['keep', '', 'slide-bottom', 4, 'but with its poor sources remained obscure...']
    ,
    ['next', 'coldwar1.gif', 'slide-zoom', 8, 'without a king <x>a cold war begins</x> with factions clashing in politics and secretive research']
    // , ['next', 'orcs3.gif', 'slide-bottom', 9, 'orcs launch skirmishes against the weakened kingdom']
    ,
    ['next', 'shroom.gif', 'slide-top-to-bottom', 10, 'druids use the <x>world shroom</x> to reinvigorate the kingdom'],
    ['next', 'foresee5.gif', 'slide-zoom', 5, 'one day one of the <x>wizards</x> realizes the true nature of the wanderer'],
    ['keep', '', 'slide-bottom', 5, 'and <x>summons a fellowship</x> to go after him...']
];
class slideshow {
    static instance;
    static pos = [542, 306];
    popup;
    slide = -1;
    slides;
    timeout;
    oldSlide;
    currentSlide;
    started = false;
    constructor() {
        console.log(slideshow.pos);
        this.popup = new popup({
            class: 'slideshow',
            title: ' ',
            hasMin: false,
            hasClose: true,
            zIndex: 3,
            onclose: () => {
                slideshow.instance = undefined;
                this.destroy();
            }
        });
        this.popup.content.innerHTML = `
			<!-- space to skip -->
			<x-slides>press space to start</x-slides>`;
        this.slides = this.popup.content.querySelector('x-slides');
        this.popup.attach();
        hooks.addListener('wcrpgStep', slideshow.step);
        //this.slide = 0;
        //this._create_new_slide();
    }
    destroy() {
        //hooks.addListener('onmousemove', this.onmousemove);
        //hooks.addListener('onmouseup', this.onmouseup);
        hooks.removeListener('wcrpgStep', slideshow.step);
    }
    static init() {
        this.request_popup();
        window['slideshow'] = slideshow;
    }
    static request_popup() {
        if (!slideshow.instance) {
            slideshow.instance = new slideshow;
        }
        else {
            slideshow.instance.popup.pos = [0, 0];
            slideshow.instance.popup.reposition();
        }
    }
    _create_new_slide() {
        const slide = slides[this.slide];
        if (slide[0] == 'never')
            return;
        if (slide[0] == 'keep') {
            this.currentSlide.innerHTML = `<x-caption>${slide[4]}</x-caption>`;
        }
        else if (slide[0] == 'next') {
            const newDiv = document.createElement('x-slide');
            newDiv.innerHTML = `<x-caption>${slide[4]}</x-caption>`;
            newDiv.style.animation = `10s ease-out 0s both ${slide[2]}`;
            newDiv.style.animation += `, 1s ease-in-out 0s both slide-fade`;
            newDiv.classList.add(slide[2]);
            newDiv.style.background = `url(img/slides/gif/${slide[1]})`;
            this.currentSlide = newDiv;
            this.slides.appendChild(newDiv);
            const oldSlide = this.oldSlide;
            setTimeout(() => {
                oldSlide?.remove();
            }, 3000);
        }
        this._queue_new_slide();
    }
    new_slide() {
        if (this.slide >= slides.length - 1)
            return;
        this.slide++;
        this.oldSlide = this.currentSlide;
        this._create_new_slide();
    }
    _queue_new_slide() {
        const slide = slides[this.slide];
        this.timeout = setTimeout(() => {
            this.new_slide();
        }, slide[3] * 1000);
    }
    static async step() {
        return slideshow.instance?.step() || false;
    }
    async step() {
        if (app.key(' ') == 1) {
            if (!this.started) {
                this.started = true;
                this.slides.innerHTML = ``;
            }
            clearTimeout(this.timeout);
            this.new_slide();
        }
        return false;
    }
}
export default slideshow;
