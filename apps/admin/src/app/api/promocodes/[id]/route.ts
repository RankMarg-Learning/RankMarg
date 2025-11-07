import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/promocodes/[id] - Get a specific promocode
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
      include: {
        applicablePlans: true
      }
    })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: promoCode
    })
  } catch (error) {
    console.error('Error fetching promocode:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promocode' },
      { status: 500 }
    )
  }
}

// PUT /api/promocodes/[id] - Update a promocode
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if code already exists (excluding current promocode)
    const existingCode = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        id: { not: params.id }
      }
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

    const promoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        description,
        discount: parseFloat(discount),
        maxUsageCount: maxUsageCount ? parseInt(maxUsageCount) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive !== undefined ? isActive : true,
        applicablePlans: {
          set: [], // Clear existing connections
          connect: applicablePlans?.map((planId: string) => ({ id: planId })) || []
        },
        updatedAt: new Date()
      },
      include: {
        applicablePlans: true
      }
    })

    return NextResponse.json({
      success: true,
      data: promoCode
    })
  } catch (error) {
    console.error('Error updating promocode:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promocode' },
      { status: 500 }
    )
  }
}

// DELETE /api/promocodes/[id] - Delete a promocode
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if promocode exists
    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id: params.id }
    })

    if (!existingPromoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      )
    }

    await prisma.promoCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting promocode:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete promocode' },
      { status: 500 }
    )
  }
}

// PATCH /api/promocodes/[id] - Toggle promocode status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    const promoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: promoCode
    })
  } catch (error) {
    console.error('Error updating promocode status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update promocode status' },
      { status: 500 }
    )
  }
}
