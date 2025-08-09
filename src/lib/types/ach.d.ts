/**
 * ACH Payment Type Definitions for EZMedTech Payment Portal
 *
 * TypeScript interfaces for ACH (Automated Clearing House) payment processing,
 * compliance tracking, and customer payment preferences. Follows healthcare
 * industry standards and NACHA regulations for ACH transactions.
 */

// ============================================================================
// PAYMENT METHOD TYPES
// ============================================================================

/**
 * Union type for all supported payment methods in the platform
 */
export type PaymentMethodType = 'card' | 'ach' | 'invoice';

/**
 * Status types for ACH payment verification
 */
export type ACHVerificationStatus =
  | 'pending'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'processing';

/**
 * ACH transaction processing status
 */
export type ACHTransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'returned'
  | 'disputed';

/**
 * ACH return codes based on NACHA standards
 */
export type ACHReturnCode =
  | 'R01' // Insufficient funds
  | 'R02' // Account closed
  | 'R03' // No account/unable to locate account
  | 'R04' // Invalid account number
  | 'R05' // Improper debit to consumer account
  | 'R06' // Returned per ODFIs request
  | 'R07' // Authorization revoked by customer
  | 'R08' // Payment stopped
  | 'R09' // Uncollected funds
  | 'R10' // Customer advises not authorized
  | 'R11' // Customer advises entry not in accordance with terms
  | 'R12' // Branch sold to another DFI
  | 'R13' // Invalid DFI identification
  | 'R14' // Representative payee deceased or unable to continue
  | 'R15' // Beneficiary or bank account holder deceased
  | 'R16' // Bank account frozen
  | 'R17' // File record edit criteria
  | 'R20' // Non-transaction account
  | 'R21' // Invalid company identification
  | 'R22' // Invalid individual ID number
  | 'R23' // Credit entry refused by receiver
  | 'R24' // Duplicate entry
  | 'R29' // Corporate customer advises not authorized
  | 'R31' // Permissible return entry
  | 'R33' // Return of XCK entry
  | 'R34' // Limited participation DFI
  | 'R35'; // Return of improper debit entry;

/**
 * Customer payment preferences priority levels
 */
export type PaymentPreferencePriority = 'primary' | 'secondary' | 'backup';

/**
 * ACH mandate compliance status
 */
export type ACHMandateStatus =
  | 'active'
  | 'revoked'
  | 'expired'
  | 'suspended'
  | 'pending_verification';

// ============================================================================
// BANK ACCOUNT INTERFACES
// ============================================================================

/**
 * Bank account details for ACH transactions
 */
export interface BankAccountDetails {
  /** Bank routing number (9 digits) */
  routingNumber: string;
  /** Last 4 digits of account number (for display) */
  accountNumberLast4: string;
  /** Account type */
  accountType: 'checking' | 'savings';
  /** Bank name */
  bankName: string;
  /** Account holder name */
  accountHolderName: string;
  /** Account holder type */
  accountHolderType: 'individual' | 'company';
}

// ============================================================================
// ACH PAYMENT METHOD INTERFACE
// ============================================================================

/**
 * ACH payment method interface with Stripe integration
 */
export interface ACHPaymentMethod {
  /** Unique identifier for the ACH payment method */
  id: string;
  /** Stripe payment method ID */
  stripePaymentMethodId: string;
  /** Customer ID this payment method belongs to */
  customerId: string;
  /** Bank account details */
  bankAccount: BankAccountDetails;
  /** Current verification status */
  verificationStatus: ACHVerificationStatus;
  /** Whether this payment method is active */
  isActive: boolean;
  /** Whether this is the default payment method */
  isDefault: boolean;
  /** Verification attempts count */
  verificationAttempts: number;
  /** Maximum allowed verification attempts */
  maxVerificationAttempts: number;
  /** Date when verification was completed */
  verifiedAt?: string;
  /** Date when verification expires (if applicable) */
  verificationExpiresAt?: string;
  /** Microdeposit amounts for verification (if used) */
  microDepositAmounts?: number[];
  /** Instant verification data (if available) */
  instantVerification?: {
    supported: boolean;
    status: 'completed' | 'failed' | 'processing';
    provider?: string;
  };
  /** Metadata for additional information */
  metadata?: Record<string, string>;
  /** Timestamp when the payment method was created */
  createdAt: string;
  /** Timestamp when the payment method was last updated */
  updatedAt: string;
  /** Timestamp when the payment method was deleted (soft delete) */
  deletedAt?: string;
}

// ============================================================================
// ACH TRANSACTION INTERFACE
// ============================================================================

/**
 * ACH transaction interface for tracking payment attempts
 */
export interface ACHTransaction {
  /** Unique transaction identifier */
  id: string;
  /** Stripe payment intent ID */
  stripePaymentIntentId: string;
  /** ACH payment method used */
  achPaymentMethodId: string;
  /** Customer ID */
  customerId: string;
  /** Transaction amount in cents */
  amountCents: number;
  /** Transaction currency (typically USD) */
  currency: string;
  /** Transaction description */
  description: string;
  /** Current transaction status */
  status: ACHTransactionStatus;
  /** ACH return code if transaction failed/returned */
  returnCode?: ACHReturnCode;
  /** Return reason description */
  returnReason?: string;
  /** Date when the transaction was initiated */
  initiatedAt: string;
  /** Expected settlement date */
  expectedSettlementAt?: string;
  /** Actual settlement date */
  settledAt?: string;
  /** Date when transaction failed */
  failedAt?: string;
  /** Number of retry attempts */
  retryAttempts: number;
  /** Maximum allowed retry attempts */
  maxRetryAttempts: number;
  /** Next retry date (if applicable) */
  nextRetryAt?: string;
  /** Related invoice ID (if applicable) */
  invoiceId?: string;
  /** Related subscription ID (if applicable) */
  subscriptionId?: string;
  /** Fee amount charged for the transaction */
  feeAmountCents?: number;
  /** Net amount received after fees */
  netAmountCents?: number;
  /** Transaction processing timeline */
  processingTimeline: {
    initiated: string;
    submitted?: string;
    processing?: string;
    settled?: string;
    failed?: string;
    returned?: string;
  };
  /** Risk assessment data */
  riskAssessment?: {
    score: number;
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  /** Metadata for additional information */
  metadata?: Record<string, string>;
  /** Timestamp when the transaction record was created */
  createdAt: string;
  /** Timestamp when the transaction record was last updated */
  updatedAt: string;
}

// ============================================================================
// CUSTOMER PAYMENT PREFERENCES INTERFACE
// ============================================================================

/**
 * Customer payment preferences interface for storing user preferences
 */
export interface CustomerPaymentPreferences {
  /** Unique identifier for preferences */
  id: string;
  /** Customer ID these preferences belong to */
  customerId: string;
  /** Preferred payment method type */
  preferredPaymentType: PaymentMethodType;
  /** List of payment methods with priority */
  paymentMethods: Array<{
    paymentMethodId: string;
    paymentMethodType: PaymentMethodType;
    priority: PaymentPreferencePriority;
    isActive: boolean;
    nickname?: string;
  }>;
  /** Auto-retry failed payments */
  autoRetryFailedPayments: boolean;
  /** Maximum retry attempts for failed payments */
  maxRetryAttempts: number;
  /** Retry interval in days */
  retryIntervalDays: number;
  /** Email notifications preferences */
  notifications: {
    paymentSuccess: boolean;
    paymentFailure: boolean;
    paymentRetry: boolean;
    upcomingPayments: boolean;
    accountUpdates: boolean;
  };
  /** ACH-specific preferences */
  achPreferences: {
    allowInstantVerification: boolean;
    requireMicroDepositVerification: boolean;
    preferredProcessingDays: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>;
    allowSameDayACH: boolean;
  };
  /** Invoice preferences (if applicable) */
  invoicePreferences?: {
    netTerms: number; // Payment terms in days
    lateFeePercentage: number;
    reminderDaysBefore: number[];
    autoSendInvoices: boolean;
  };
  /** Timestamp when preferences were created */
  createdAt: string;
  /** Timestamp when preferences were last updated */
  updatedAt: string;
}

// ============================================================================
// ACH MANDATE LOG INTERFACE
// ============================================================================

/**
 * ACH mandate log interface for compliance tracking
 */
export interface ACHMandateLog {
  /** Unique identifier for the mandate log entry */
  id: string;
  /** Customer ID the mandate belongs to */
  customerId: string;
  /** ACH payment method ID */
  achPaymentMethodId: string;
  /** Mandate status */
  status: ACHMandateStatus;
  /** Mandate type */
  mandateType: 'one_time' | 'recurring' | 'variable';
  /** Mandate text that was presented to customer */
  mandateText: string;
  /** Method of mandate collection */
  collectionMethod: 'online' | 'phone' | 'in_person' | 'mail';
  /** Customer consent details */
  customerConsent: {
    /** Whether customer provided explicit consent */
    consentGiven: boolean;
    /** Consent timestamp */
    consentTimestamp: string;
    /** IP address where consent was given */
    ipAddress?: string;
    /** User agent of the browser/device */
    userAgent?: string;
    /** Digital signature (if collected) */
    digitalSignature?: string;
    /** Consent verification method */
    verificationMethod: 'click_to_agree' | 'digital_signature' | 'verbal' | 'written';
  };
  /** Authorization details */
  authorization: {
    /** Authorized amount (null for variable amounts) */
    authorizedAmount?: number;
    /** Authorization frequency */
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually' | 'variable';
    /** Effective date of authorization */
    effectiveDate: string;
    /** Expiration date (if applicable) */
    expirationDate?: string;
    /** Maximum amount per transaction (for variable mandates) */
    maxTransactionAmount?: number;
  };
  /** Revocation details (if applicable) */
  revocation?: {
    /** Date when mandate was revoked */
    revokedAt: string;
    /** Revocation method */
    revocationMethod: 'online' | 'phone' | 'email' | 'mail';
    /** Reason for revocation */
    reason?: string;
    /** IP address where revocation occurred */
    ipAddress?: string;
    /** Staff member who processed revocation */
    processedBy?: string;
  };
  /** Compliance audit trail */
  auditTrail: Array<{
    /** Action performed */
    action: 'created' | 'updated' | 'activated' | 'suspended' | 'revoked' | 'expired';
    /** Timestamp of action */
    timestamp: string;
    /** User/system that performed action */
    performedBy: string;
    /** Additional details about the action */
    details?: string;
    /** IP address where action occurred */
    ipAddress?: string;
  }>;
  /** NACHA compliance data */
  nachaCompliance: {
    /** SEC code used for the mandate */
    secCode: 'PPD' | 'CCD' | 'WEB' | 'TEL' | 'RCK' | 'POP' | 'ARC' | 'BOC';
    /** Company entry description */
    companyEntryDescription: string;
    /** Addenda records (if any) */
    addendaRecords?: string[];
  };
  /** Related documents */
  documents?: Array<{
    /** Document type */
    type: 'mandate_form' | 'consent_record' | 'authorization_letter' | 'revocation_notice';
    /** Document URL or identifier */
    documentUrl: string;
    /** Document filename */
    filename: string;
    /** File size in bytes */
    fileSize: number;
    /** Upload timestamp */
    uploadedAt: string;
  }>;
  /** Metadata for additional information */
  metadata?: Record<string, string>;
  /** Timestamp when the mandate log was created */
  createdAt: string;
  /** Timestamp when the mandate log was last updated */
  updatedAt: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Response type for ACH payment method creation
 */
export interface CreateACHPaymentMethodResponse {
  success: boolean;
  paymentMethod?: ACHPaymentMethod;
  error?: string;
  details?: string;
}

/**
 * Response type for ACH transaction processing
 */
export interface ProcessACHTransactionResponse {
  success: boolean;
  transaction?: ACHTransaction;
  error?: string;
  details?: string;
}

/**
 * ACH payment processing options
 */
export interface ACHProcessingOptions {
  /** Whether to use same-day ACH (if available) */
  useSameDayACH?: boolean;
  /** Custom description for the transaction */
  description?: string;
  /** Metadata to attach to the transaction */
  metadata?: Record<string, string>;
  /** Whether to send email notifications */
  sendNotifications?: boolean;
  /** Custom retry configuration */
  retryConfig?: {
    maxAttempts: number;
    intervalDays: number;
  };
}

/**
 * ACH verification options
 */
export interface ACHVerificationOptions {
  /** Preferred verification method */
  verificationMethod: 'microdeposits' | 'instant' | 'manual';
  /** Whether to skip verification (for trusted customers) */
  skipVerification?: boolean;
  /** Custom verification amounts (for testing) */
  customMicroDepositAmounts?: number[];
}
