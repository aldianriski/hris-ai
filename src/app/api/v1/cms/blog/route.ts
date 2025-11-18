import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBlogPosts, createBlogPost } from '@/lib/db/cms-queries';
import type { CreateBlogPostInput } from '@/lib/db/cms-schema';

/**
 * GET /api/v1/cms/blog
 * List blog posts with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      status: searchParams.get('status') as any,
      category: searchParams.get('category') || undefined,
      language: searchParams.get('language') as any,
      search: searchParams.get('search') || undefined,
    };

    const result = await getBlogPosts(supabase, filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CMS_BLOG_FETCH_ERROR',
          message: error.message || 'Failed to fetch blog posts',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/cms/blog
 * Create a new blog post (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // TODO: Add auth check for admin/content_manager role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const body: CreateBlogPostInput = await request.json();

    // Validate required fields
    if (!body.slug || !body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: slug, title, content',
          },
        },
        { status: 400 }
      );
    }

    // Set author_id to current user
    body.author_id = user.id;

    const blogPost = await createBlogPost(supabase, body);

    return NextResponse.json({
      success: true,
      data: blogPost,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CMS_BLOG_CREATE_ERROR',
          message: error.message || 'Failed to create blog post',
        },
      },
      { status: 500 }
    );
  }
}
