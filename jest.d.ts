import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveClass(className: string): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeInvalid(): R
      toBeValid(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveStyle(style: string | object): R
      toBeEmptyDOMElement(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toHaveFormValues(expectedValues: Record<string, any>): R
      toHaveErrorMessage(text: string | RegExp): R
      toHaveDescription(text: string | RegExp): R
      toHaveAccessibleName(text: string | RegExp): R
      toHaveAccessibleDescription(text: string | RegExp): R
    }
  }
}