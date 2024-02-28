import { derived, writable, type Readable, type Stores, type StoresValues } from 'svelte/store';

/**
 * The objective is for the props returned from builders
 * to be interpreted as const without having to add `as const`
 * by using the new const modifier with generics.
 */

/**
 * MakeElement Examples
 */

makeElement({
  stores: [writable(true)],
  // Without declaring the store values parameter, the object is interpreted as const.
  returned: () => {
    return {
      'data-state': 'closed',
    };
  },
}).subscribe(data => {
  data; // { readonly 'data-state': "closed"; }
});

makeElement({
  stores: [writable(true)],
  // If we declare the store values parameter, the object is no longer interpreted as const.
  returned: ([$open]) => {
    return {
      'data-state': 'closed',
    };
  },
}).subscribe(data => {
  data; // { 'data-state': string; }
});

makeElement({
  stores: [writable(true)],
  // If we add an explicit type for the store values parameter, the object is interpreted as const.
  // Note that TS already knew the type of the parameter without needing to explicitly define it.
  // But for some reason adding the explicit type, makes the object be interpreted as const.
  returned: ([$open]: [boolean]) => {
    return {
      'data-state': 'closed',
    };
  },
}).subscribe(data => {
  data; // { readonly 'data-state': "closed"; }
});

/**
 * MakeElement Logic
 */

type ElementProps = Record<string, any>;

type ElementCallback<S extends Stores, P extends ElementProps> = (values: StoresValues<S>) => (() => P) | P;

type MakeElementArgs<S extends Stores, P extends ElementProps, R extends ElementCallback<S, P>> = {
  stores: S;
  returned: R;
};

type MakeElement<S extends Stores, P extends ElementProps, R extends ElementCallback<S, P>> = Readable<
  ReturnType<R>
>;

function makeElement<
  const S extends Stores,
  const P extends ElementProps,
  const R extends ElementCallback<S, P>
>(data: MakeElementArgs<S, P, R>): MakeElement<S, P, R> {
  const { returned, stores } = data;

  return derived(stores, values => {
    return returned(values as StoresValues<S>);
  }) as MakeElement<S, P, R>;
}
