import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test register endpoint hit');
    
    const body = await request.json();
    console.log('Received body:', body);
    
    const { email, password, name } = body;
    console.log('Extracted fields:', { email, password: !!password, name });
    
    if (!email || !password || !name) {
      console.log('Validation failed - missing fields');
      return NextResponse.json({ 
        error: 'جميع الحقول مطلوبة',
        received: { email: !!email, password: !!password, name: !!name }
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم الاستلام بنجاح',
      data: { email, name }
    });
    
  } catch (error) {
    console.error('Test register error:', error);
    return NextResponse.json({ 
      error: 'خطأ في الخادم',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}