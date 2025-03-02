import { catchError, map, Observable, of, OperatorFunction, scan, startWith, switchMap } from "rxjs";
import { LoadingState } from '@types';


export function switchMapWithLoading<T>(
    observableFunction: (value: any) => Observable<T>
): OperatorFunction<any, LoadingState<T>> {
    return (source: Observable<any>) =>
        source.pipe(
            switchMap(value =>
                observableFunction(value).pipe(
                    map(data => ({ data, loading: false })),
                    catchError(error => of({ error, loading: false })),
                    startWith({error: null, loading: true})
                )
            ),
            scan((state: LoadingState<T>, change: LoadingState<T>) => ({
                ...state,
                ...change
            }))
        )
}