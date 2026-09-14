import { NextRequest, NextResponse } from 'next/server';
import { addCategory, deleteCategory } from '@/lib/admin';
import { getCategories } from '@/lib/products';

export async function GET() {
  try {
    const cats = await getCategories();
    return NextResponse.json(cats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    const newCat = await addCategory(body);
    return NextResponse.json({ success: true, category: newCat });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }
    await deleteCategory(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

