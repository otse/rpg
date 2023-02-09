
// inspired by gmod lua !

// it is useful to prevent circular dependencies and or import hell
// also called eventing library, and event emitter

type func = (any) => boolean

export class hooks<T = never> {
    //static readonly table: { [name: string]: func[] } = {}
    //list: func[] = []
    static register(name: string, f: func) {
        if (!hooks[name])
            hooks[name] = [];
        hooks[name].push(f);
        return f;
    }
    static unregister(name: string, f: func) {
        hooks[name] = hooks[name].filter(e => e != f);
    }
    static call(name: string, x: any) {
        if (!hooks[name])
            return;
        for (let i = hooks[name].length; i--;)
            if (hooks[name][i](x))
                return;
    }
}

export default hooks;