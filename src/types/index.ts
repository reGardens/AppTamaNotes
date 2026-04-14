// === Entitas Utama ===

export interface User {
  id: string;
  email: string;
  password: string;
}

export interface ShoppingNote {
  id: string;
  userId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// === Input Types ===

export interface CreateNoteInput {
  userId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateNoteInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

// === Draft & Form ===

export interface DraftNote {
  itemName: string;
  quantity: string;
  unitPrice: string;
}

// === Validasi ===

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// === API Response ===

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
