import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { User, ResetPasswordInput } from '@/types';
import { validatePassword } from '@/lib/validatePassword';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordInput;
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0] },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Email tidak ditemukan' },
        { status: 404 }
      );
    }

    users[userIndex].password = newPassword;
    await writeUsers(users);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
