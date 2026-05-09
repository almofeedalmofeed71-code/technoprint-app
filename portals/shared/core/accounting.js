/**
 * TECHOPRINT - Core Accounting Module
 * Sheet-Based Accounting System
 * Total Pages = Sheets × 2
 * Version: 2.0.0
 */

// Cost Constants (IQD)
const COSTS = {
    PAPER_PER_SHEET: 100,        // Paper cost per sheet
    INK_PER_PAGE: 50,            // Ink cost per page (both sides)
    COVER_COST: 150,             // Cover cost per unit
    DELIVERY_FEE: 3000           // Delivery fee
};

// Pricing (IQD)
const PRICES = {
    A5_PER_PAGE: 500,
    A4_PER_PAGE: 1000,
    PRINT_MULTIPLIER: {
        LASER_COLOR: 2,
        OIL_COLOR: 3,
        BW: 1
    },
    BINDING: {
        NONE: 0,
        SPIRAL: 2000,
        THERMAL: 5000,
        STAPLE: 1000
    }
};

/**
 * Calculate total pages from sheet count
 * Formula: Total Pages = Sheets × 2 (for duplex)
 */
function calculateTotalPages(sheets, duplex = false) {
    if (duplex) {
        return sheets * 2; // Both sides used
    }
    return sheets; // Single side
}

/**
 * Calculate operational cost breakdown
 */
function calculateOperationalCost(sheets, duplex, hasCover = false) {
    const pages = calculateTotalPages(sheets, duplex);
    
    // Paper cost (per sheet)
    const paperCost = sheets * COSTS.PAPER_PER_SHEET;
    
    // Ink cost (per page - both sides count as separate pages)
    const inkCost = pages * COSTS.INK_PER_PAGE;
    
    // Cover cost
    const coverCost = hasCover ? COSTS.COVER_COST : 0;
    
    // Total operational cost
    const totalOperationalCost = paperCost + inkCost + coverCost;
    
    return {
        sheets,
        pages,
        paperCost,
        inkCost,
        coverCost,
        totalOperationalCost
    };
}

/**
 * Calculate print order price
 */
function calculateOrderPrice(paperSize, printType, sheets, duplex, binding, hasCover = false) {
    // Base price per page
    const basePrice = paperSize === 'A4' ? PRICES.A4_PER_PAGE : PRICES.A5_PER_PAGE;
    
    // Print multiplier
    const multiplier = PRICES.PRINT_MULTIPLIER[printType] || 1;
    
    // Calculate pages
    const pages = calculateTotalPages(sheets, duplex);
    
    // Print revenue
    const printRevenue = pages * basePrice * multiplier;
    
    // Binding cost
    const bindingCost = PRICES.BINDING[binding] || 0;
    
    // Cover cost
    const coverCost = hasCover ? COSTS.COVER_COST : 0;
    
    // Total price (excluding delivery for now)
    const subtotal = printRevenue + bindingCost + coverCost;
    
    // Grand total
    const total = subtotal + COSTS.DELIVERY_FEE;
    
    return {
        basePrice,
        multiplier,
        pages,
        printRevenue,
        bindingCost,
        coverCost,
        deliveryFee: COSTS.DELIVERY_FEE,
        subtotal,
        total
    };
}

/**
 * Generate Material Analysis Report
 */
function generateMaterialAnalysis(orders) {
    return orders.map(order => {
        const cost = calculateOperationalCost(
            order.sheets,
            order.duplex === 'double',
            order.hasCover
        );
        
        const revenue = calculateOrderPrice(
            order.paperSize,
            order.printType,
            order.sheets,
            order.duplex,
            order.binding,
            order.hasCover
        );
        
        // Gross profit
        const grossProfit = revenue.total - cost.totalOperationalCost;
        
        // Net profit (after subtracting cover cost)
        const netProfit = grossProfit - cost.coverCost;
        
        return {
            orderId: order.id,
            date: order.date,
            sheets: cost.sheets,
            pages: cost.pages,
            paperCost: cost.paperCost,
            inkCost: cost.inkCost,
            coverCount: order.hasCover ? cost.sheets : 0,
            coverCost: cost.coverCost,
            totalOperationalCost: cost.totalOperationalCost,
            revenue: revenue.total,
            grossProfit,
            netProfit,
            status: order.status
        };
    });
}

/**
 * Inventory Movement Handler
 * OUT movements can now be deleted to revert quantities
 */
class InventoryManager {
    constructor() {
        this.inventory = [];
        this.movements = [];
    }

    addMovement(type, itemId, quantity, reason = '') {
        const movement = {
            id: `MOV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type, // 'IN' or 'OUT'
            itemId,
            quantity,
            reason,
            timestamp: new Date().toISOString(),
            deleted: false
        };
        
        this.movements.push(movement);
        this.applyMovement(movement);
        
        return movement;
    }

    applyMovement(movement) {
        const item = this.inventory.find(i => i.id === movement.itemId);
        if (!item) return;

        if (movement.type === 'IN') {
            item.quantity += movement.quantity;
        } else if (movement.type === 'OUT') {
            item.quantity -= movement.quantity;
        }
    }

    revertMovement(movementId) {
        const movement = this.movements.find(m => m.id === movementId);
        if (!movement || movement.deleted) return false;

        // Mark as deleted
        movement.deleted = true;
        movement.deletedAt = new Date().toISOString();

        // Revert the quantity change
        const item = this.inventory.find(i => i.id === movement.itemId);
        if (item) {
            if (movement.type === 'IN') {
                item.quantity -= movement.quantity;
            } else if (movement.type === 'OUT') {
                item.quantity += movement.quantity;
            }
        }

        return true;
    }

    getMovements(filters = {}) {
        return this.movements.filter(m => {
            if (filters.type && m.type !== filters.type) return false;
            if (filters.itemId && m.itemId !== filters.itemId) return false;
            if (filters.includeDeleted !== true && m.deleted) return false;
            return true;
        });
    }

    getInventory() {
        return this.inventory;
    }
}

// Singleton instance
export const accounting = {
    COSTS,
    PRICES,
    calculateTotalPages,
    calculateOperationalCost,
    calculateOrderPrice,
    generateMaterialAnalysis,
    inventoryManager: new InventoryManager()
};

export default accounting;