// A union of possible Firestore operations for which permission can be denied.
export type SecurityRuleOperation = 'get' | 'list' | 'create' | 'update' | 'delete';

// The context for a Firestore security rule denial. This is used to create
// a rich error message that helps developers debug their security rules.
export type SecurityRuleContext = {
  path: string;
  operation: SecurityRuleOperation;
  // The data that was being sent to Firestore (for write operations).
  requestResourceData?: any;
};

/**
 * A custom error class for Firestore permission-denied errors.
 * This class is designed to be thrown in the application's catch blocks
 * when a Firestore request fails due to security rules. It formats the
 * error message in a way that can be easily parsed and displayed in the
 * Next.js error overlay.
 */
export class FirestorePermissionError extends Error {
  constructor(context: SecurityRuleContext) {
    // The message is a JSON string that will be parsed by the error overlay.
    // It provides a structured way to view the context of the error.
    const message = `
FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore security rules:

${JSON.stringify(context, null, 2)}
`;
    super(message);
    this.name = 'FirestorePermissionError';
  }
}
