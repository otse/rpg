import app from "../app.js";
import { hooks } from "../lib/hooks.js";
import popup from "./popup.js";
const slides = [
    ['next', 'temples1.webp', 'slide-zoom', 8, 'it is a dark age of magic and cultural decline...'],
    ['next', 'king1.webp', 'slide-zoom', 8, 'the king has ordered its court to research necromancy while also banning magic and promoting paganism...']
    // , ['only', 'paladins.webp', 'slide-bottom', 5, 'its paladins, healers and temples are allowed to cast spells']
    //, ['next', 'exiles2.webp', 'slide-bottom', 5, 'commoners are exiled']
    //, ['next', 'grimoire.webp', 'slide-left', 5, 'grimoires are destroyed']
    // , ['next', 'siege3.webp', 'slide-bottom', 4, 'holds turn into factions']
    ,
    ['next', 'siege3.webp', 'slide-bottom', 8, 'counties turn into factions and civil war ravages the kingdom'],
    ['next', 'arguing1.webp', 'slide-zoom', 5, 'a gathering of wizards hold council and call for peace'],
    ['keep', '', 'slide-zoom', 5, 'and at their insistence the king stands down']
    //, ['next', 'defeat2.webp', 'slide-bottom', 6, 'but contained within him was a dark corruption...']
    ,
    ['next', 'wanderer6.webp', 'slide-shadow-king', 5, 'to become a shadow...'],
    ['keep', '', 'slide-bottom', 5, 'seeding corruption in his wake...'],
    ['next', 'book2.webp', 'slide-bottom', 8, 'magic was free again but remained obscure with poor sources...']
    // , ['keep', '', 'slide-bottom', 4, 'but with its poor sources remained obscure...']
    ,
    ['next', 'coldwar1.webp', 'slide-zoom', 8, 'without a king a cold war begins with factions clashing in politics and secretive research']
    // , ['next', 'orcs3.webp', 'slide-bottom', 9, 'orcs launch skirmishes against the weakened kingdom']
    ,
    ['next', 'shroom.webp', 'slide-top-to-bottom', 10, 'druids use the world shroom to channel power to the kingdom'],
    ['next', 'foresee5.webp', 'slide-zoom', 5, 'one day one of the wizards realizes the wanderer must be found and stopped'],
    ['keep', '', 'slide-bottom', 5, 'and summons a fellowship to go after him...']
];
class slideshow {
    static instance;
    static pos = [542, 306];
    popup;
    slide = 0;
    slides;
    timeout;
    oldSlide;
    currentSlide;
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
			<!--space to skip-->
			<x-slides></x-slides>`;
        this.slides = this.popup.content.querySelector('x-slides');
        this.popup.attach();
        hooks.addListener('wcrpgStep', slideshow.step);
        this._create_new_slide();
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
        if (slide[0] == 'keep') {
            this.currentSlide.innerHTML = slide[4];
        }
        else {
            const newDiv = document.createElement('x-slide');
            newDiv.innerHTML = slide[4];
            newDiv.style.animation = `10s ease-out 0s both ${slide[2]}`;
            newDiv.style.animation += `, 2s ease-in-out 0s both slide-fade`;
            newDiv.classList.add(slide[2]);
            newDiv.style.background = `url(img/slides/${slide[1]})`;
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
            clearTimeout(this.timeout);
            this.new_slide();
        }
        return false;
    }
}
export default slideshow;
