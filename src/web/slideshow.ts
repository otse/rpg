import app from "../app.js";
import { hooks } from "../lib/hooks.js";
import popup from "./popup.js";

type slide = [mode: 'keep' | 'next', image: string, animation: string, duration: number, text: string]
const slides: slide[] = [
	['next', 'temples1.webp', 'slide-zoom', 7, 'it is a dark age of magic...']
	, ['next', 'king1.webp', 'slide-left', 7, 'the king has ordered its court to research necromancy while also banning magic and promoting paganism']
	// , ['only', 'paladins.webp', 'slide-bottom', 5, 'its paladins, healers and temples are allowed to cast spells']
	, ['next', 'exiles2.webp', 'slide-bottom', 5, 'commoners are exiled when protesting']
	, ['next', 'grimoire.webp', 'slide-left', 5, 'grimoires are destroyed']
	, ['next', 'siege3.webp', 'slide-bottom', 4, 'holds turn into factions']
	, ['keep', '', 'slide-bottom', 4, 'the lands are thrown into civil war...']
	, ['next', 'arguing1.webp', 'slide-left', 5, 'wise wizards call for peace']
	, ['next', 'defeat2.webp', 'slide-zoom', 4, 'and at their insistence the king stands down']
	, ['keep', '', 'slide-bottom', 5, 'but contained within him was a dark corruption...']
	, ['next', 'wanderer6.webp', 'slide-fall', 5, 'he clad in rags and wandered for ages']
	, ['keep', '', 'slide-bottom', 4, 'seeding corruption in his wake...']
	, ['next', 'book2.webp', 'slide-left', 5, 'magic was no longer outlawed']
	// , ['keep', '', 'slide-bottom', 4, 'but with its poor sources remained obscure...']
	, ['next', 'coldwar1.webp', 'slide-zoom', 9, 'without a king a cold war begins with factions clashing in politics and secretive research']
	, ['next', 'orcs3.webp', 'slide-zoom', 9, 'orcs launch skirmishes against the weakened kingdom']
	, ['next', 'foresee5.webp', 'slide-zoom', 5, 'one day one of the wizards realizes his mistake']
	, ['keep', '', 'slide-bottom', 5, 'and he creates a fellowship to go after the wanderer']
]
class slideshow {
	static instance?: slideshow
	static pos: vec2 = [542, 306]
	popup: popup;
	slide = 0
	slides
	timeout
	oldSlide
	currentSlide
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
		this.popup.content.innerHTML = `space to skip
			<x-slides></x-slides>`;
		this.slides = this.popup.content.querySelector('x-slides');

		this.popup.attach();
		hooks.addListener('wcrpgStep', slideshow.step);
		this.create_new_slide();
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
	create_new_slide() {
		const slide = slides[this.slide];
		if (slide[0] == 'keep') {
			this.currentSlide.innerHTML = slide[4];
		}
		else {
			const newDiv = document.createElement('x-slide');
			newDiv.innerHTML = slide[4];
			newDiv.style.animationName = slide[2];
			newDiv.style.background = `url(img/slides/${slide[1]})`;
			this.currentSlide = newDiv;
			this.slides.appendChild(newDiv);
			const oldSlide = this.oldSlide;
			if (oldSlide)
				setTimeout(() => {
					oldSlide.remove();
				}, slide[3] * 1000);
		}
		this.queue_new_slide();
	}
	new_slide() {
		if (this.slide >= slides.length - 1)
			return;
		this.slide++;
		this.oldSlide = this.currentSlide;
		this.create_new_slide();
	}
	queue_new_slide() {
		this.timeout = setTimeout(() => {
			this.new_slide();
		}, slides[this.slide][3] * 1000);
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