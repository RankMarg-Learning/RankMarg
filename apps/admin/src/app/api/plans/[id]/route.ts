import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/plans/[id] - Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: plan
    })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}

// PUT /api/plans/[id] - Update a plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name,
        description,
        amount: parseFloat(amount),
        currency: currency || 'INR',
        duration: parseInt(duration),
        features: features || [],
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: plan
    })
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/plans/[id] - Delete a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { planId: params.id, status: 'ACTIVE' }
    })

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete plan with active subscriptions' },
        { status: 400 }
      )
    }

    await prisma.plan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}

// PATCH /api/plans/[id] - Toggle plan status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: plan
    })
  } catch (error) {
    console.error('Error updating plan status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update plan status' },
      { status: 500 }
    )
  }
}
