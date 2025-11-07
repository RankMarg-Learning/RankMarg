import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let whereClause: any = {}

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active'
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const plans = await prisma.plan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: plans
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

// POST /api/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, amount, currency, duration, features, isActive } = body

    // Validation
    if (!name || !amount || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        amount: parseFloat(amount),
        currency: currency || 'INR',
        duration: parseInt(duration),
        features: features || [],
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      data: plan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}
