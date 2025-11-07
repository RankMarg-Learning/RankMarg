import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/promocodes - Get all promocodes
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
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const promoCodes = await prisma.promoCode.findMany({
      where: whereClause,
      include: {
        applicablePlans: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: promoCodes
    })
  } catch (error) {
    console.error('Error fetching promocodes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promocodes' },
      { status: 500 }
    )
  }
}

// POST /api/promocodes - Create a new promocode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, description, discount, maxUsageCount, validFrom, validUntil, isActive, applicablePlans } = body

    // Validation
    if (!code || !discount || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      )
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json(
        { success: false, error: 'Valid until date must be after valid from date' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discount: parseFloat(discount),
        maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
        currentUsageCount: 0,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive !== undefined ? isActive : true,
        applicablePlans: {
          connect: applicablePlans?.map((planId: string) => ({ id: planId })) || []
        }
      },
      include: {
        applicablePlans: true
      }
    })

    return NextResponse.json({
      success: true,
      data: promoCode
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating promocode:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create promocode' },
      { status: 500 }
    )
  }
}
