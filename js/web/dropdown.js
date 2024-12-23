class dropdown {
    options;
    button;
    dropdown;
    inner;
    group;
    opened = false;
    constructor(options) {
        this.options = options;
        this.group = document.createElement('x-dropdown-group');
        this.group.classList.add(options.class);
        this.group.innerHTML = `
			<x-dropdown-button>
				<x-dropdown-button-inner>
					${options.button}
				</x-dropdown-button-inner>
			</x-dropdown-button>
			<x-dropdown-offset>
				<x-dropdown>
					<x-dropdown-inner>
					</x-dropdown-inner>
				</x-dropdown>
			</x-dropdown-offset>
		`;
        this.button = this.group.querySelector('x-dropdown-button');
        this.dropdown = this.group.querySelector('x-dropdown');
        this.inner = this.group.querySelector('x-dropdown-inner');
        this.button.onclick = () => {
            this.opened = !this.opened;
            if (this.opened)
                this.open();
            else
                this.close();
        };
        for (const tuple of options.options) {
            const value = document.createElement('x-dropdown-value');
            value.innerHTML = tuple[1];
            value.onclick = () => {
                this.close();
                options.handler(tuple);
            };
            this.inner.append(value);
        }
    }
    open() {
        this.opened = true;
        this.dropdown.style.display = 'flex';
    }
    close() {
        this.opened = false;
        this.dropdown.style.display = 'none';
    }
    attach(element) {
        element.append(this.group);
    }
}
export default dropdown;
