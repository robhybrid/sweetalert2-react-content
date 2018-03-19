import { ReactElement } from 'react';
import swal, { SweetAlertOptions, SweetAlertResult, SweetAlertType } from 'sweetalert2';

/**
 * Wraps SweetAlert2 implementation with a compatible implementation that supports React elements.
 * Example:
 *     import swal from 'sweetalert2';
 *
 *     const mySwal = withReactContent(swal)
 *     const mySwal = withReactContent()
 *
 * @param parentSwal SweetAlert2-compatible implementation if you want to pass your own wrapper.
 *                   By default, it will be the SweetAlert2 library itself.
 *
 * @returns A SweetAlert2-compatible interface with React capabilities added.
 */
export default function withReactContent(parentSwal?: SweetAlert2): SweetAlert2 & ReactSweetAlert;

/**
 * Mimics SweetAlert2's call signatures, adding React elements as valid inputs.
 */
interface ReactSweetAlert {
  (title?: ReactElementOr<'title'>, message?: ReactElementOr<'html'>, type?: SweetAlertType): Promise<SweetAlertResult>;

  (options: ReactSweetAlertOptions & { useRejections?: false }): Promise<SweetAlertResult>;

  (options: ReactSweetAlertOptions & { useRejections: true }): Promise<any>;
}

type SweetAlert2 = typeof swal;

type ReactSweetAlertOptions = Overwrite<SweetAlertOptions, ReactOptions>;

type ReactElementOr<K extends keyof SweetAlertOptions> = SweetAlertOptions[K] | ReactElement<any>;

interface ReactOptions {
  title?: ReactElementOr<'title'>;
  html?: ReactElementOr<'html'>;
  confirmButtonText?: ReactElementOr<'confirmButtonText'>;
  cancelButtonText?: ReactElementOr<'cancelButtonText'>;
  footer?: ReactElementOr<'footer'>;
}

// Diff<> and Owerwrite<> types below are inspired from this GitHub comment:
// https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-307871458

// Diff<T, U> is a subtraction operator for string literal types.
// It returns the string types of T that are not in U.
// ex: Diff<('a' | 'b' | 'c'), ('c' | 'd')>;  // 'a' | 'b'
type Diff<T extends string, U extends string> =
  ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];

// Overwrite<T, U> will take the properties of U and add to it the properties of T that are not in U.
// This emulates an overwrite (override) of chosen properties of T with properties of U.
// It works like { ...T, ...U } in JS.
type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;