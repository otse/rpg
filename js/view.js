import dropdown from "./dropdown";
class view {
    dropdown;
    constructor() {
        const handler = (tuple) => {
            console.log(tuple);
        };
        this.dropdown = new dropdown({
            class: 'view',
            button: 'View',
            options: [
                [0, 'Character'],
                [1, 'World Map']
            ],
            handler: handler
        });
        const destination = document.querySelector('x-top-bar-inner x-dropdown-destination');
        this.dropdown.attach(destination);
    }
}
export default view;
