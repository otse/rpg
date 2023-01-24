class view {
    element;
    dropdown;
    constructor() {
        this.element = document.querySelector('x-view-dropdown-group x-view-button');
        this.dropdown = document.querySelector('x-view-dropdown-group x-dropdown');
        this.dropdown.style.display = 'none';
        this.element.onclick = () => {
            console.log('popout');
            this.dropdown.style.display = 'flex';
        };
    }
}
export default view;
