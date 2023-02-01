import { Store } from "@neos-project/neos-ui";
import { selectors } from "@neos-project/neos-ui-redux-store";
import { distinctUntilChanged, map, Observable, shareReplay } from "rxjs";

export const makeCreateValueStreamFromNodeProperty = (deps: { store: Store }) => {
    const createValueStreamFromNodeProperty = <T>(propertyId: string) => {
        const neosStoreChange$ = new Observable<void>((subscriber) => {
            subscriber.next();
            const unsubscribe = deps.store.subscribe(() => {
                subscriber.next();
            });
            return unsubscribe;
        })

        const values$ = neosStoreChange$.pipe(
            map(() => {
                // same logic as how the value will normally be acquired:
                // https://github.com/neos/neos-ui/blob/6aa5c74e75e4813ffd798905811d099df30d5705/packages/neos-ui/src/Containers/RightSideBar/Inspector/InspectorEditorEnvelope/index.js#L81
                const transientValuesByPropertyId = selectors.UI.Inspector.transientValues(deps.store.getState());
                if (transientValuesByPropertyId && propertyId in transientValuesByPropertyId) {
                    return transientValuesByPropertyId[propertyId].value as T;
                } else {
                    const possiblyUpdatedNode = selectors.CR.Nodes.focusedSelector(deps.store.getState())!;
                    return possiblyUpdatedNode.properties[propertyId] as T
                }
            }),
            distinctUntilChanged(),
            shareReplay({
                refCount: true, // unsubscribe at the end
                bufferSize: 1
            })
        )

        return values$;
    }
    return createValueStreamFromNodeProperty;
}
