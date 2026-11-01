/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ScreenId } from './components/Sidebar';
import { Header } from './components/Header';
import { PhotoPreviewModal } from './components/Modals/PhotoPreviewModal';
import { ProductModal } from './components/Modals/ProductModal';
import { ReviewModal } from './components/Modals/ReviewModal';
import { ServiceTicketModal } from './components/Modals/ServiceTicketModal';
import { NotificationsDrawer } from './components/Modals/NotificationsDrawer';

import { AdminOverview } from './views/AdminOverview';
import { ServiceQueueView } from './views/ServiceQueueView';
import { StockInventoryView } from './views/StockInventoryView';
import { SqlArchitectureHub } from './views/SqlArchitectureHub';
import { AiDiagnosticsEngine } from './views/AiDiagnosticsEngine';
import { CustomerStorefront } from './views/CustomerStorefront';
import { ProductDetailView } from './views/ProductDetailView';
import { OrdersDashboard } from './components/admin/OrdersDashboard';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { ProductManagementDashboard } from './components/admin/ProductManagementDashboard';
import { AiImageLibrary } from './components/admin/AiImageLibrary';
import { DeleteConfirmModal } from './components/Modals/DeleteConfirmModal';

import {
  INITIAL_LEADS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_SPARE_PARTS,
  PLACEHOLDER_PRODUCT_IMAGE,
} from './data/initialData';
import { Lead, Product, Review, StoreSettings, ServiceTicket, SparePart, LeadStatus } from './types';
import {
  submitClientOrder,
  fetchProductsFromSupabase,
  upsertProductToSupabase,
  deleteProductFromSupabase,
} from './lib/supabaseClient';
import { analyzeProductPhoto } from './lib/productImageAnalyzer';

const LOCAL_STORAGE_PRODUCTS_KEY = 'apz_products_v2';

function getInitialProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading saved products from localStorage:', err);
  }
  return INITIAL_PRODUCTS;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isKannada, setIsKannada] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Core collections
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_SERVICE_TICKETS);
  const [spareParts, setSpareParts] = useState<SparePart[]>(INITIAL_SPARE_PARTS);

  // Sync products state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
      } catch (err) {
        console.warn('Error saving products to localStorage:', err);
      }
    }
  }, [products]);

  // Initial fetch / synchronization with Supabase DB
  useEffect(() => {
    let isMounted = true;
    fetchProductsFromSupabase().then((remoteProds) => {
      if (isMounted && remoteProds && remoteProds.length > 0) {
        setProducts(remoteProds);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Modals & Navigation state
  const [photoLead, setPhotoLead] = useState<Lead | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Handlers for Leads
  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  };

  const handleUpdateLeadNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
  };

  const handleAddLead = async (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);

    // Also persist into Supabase orders table
    try {
      await submitClientOrder({
        customer_name: newLead.customerName,
        phone: newLead.phone,
        area: newLead.locality || 'Tumakuru',
        order_type: 'enquiry',
        notes: `TDS: ${newLead.tdsPpm || 'N/A'} | Source: ${newLead.waterSource} | ${newLead.notes || ''}`,
        source: 'website_form',
      });
    } catch {
      // Handled internally in submitClientOrder
    }
  };

  // Handlers for Products (Synchronized with local storage and Supabase)
  const handleToggleProductStock = (productId: string) => {
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = !p.inStock;
          updatedProd = {
            ...p,
            inStock: nextStock,
            stockQuantity: nextStock ? Math.max(1, p.stockQuantity ?? 1) : 0,
            updatedAt: new Date().toISOString(),
          };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleToggleProductVisibility = (productId: string) => {
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextVis = !p.visibleOnStorefront;
          updatedProd = {
            ...p,
            visibleOnStorefront: nextVis,
            isPublished: nextVis,
            updatedAt: new Date().toISOString(),
          };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleToggleProductFeatured = (productId: string) => {
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProd = { ...p, featured: !p.featured, updatedAt: new Date().toISOString() };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    let visual: any = {};
    if (product.image) {
      try {
        visual = await analyzeProductPhoto(product.image, { name: product.name, category: product.category });
      } catch {}
    }

    const isCustomUpload =
      Boolean(product.is_user_uploaded) &&
      Boolean(product.image) &&
      !product.image.includes('lh3.googleusercontent.com') &&
      !product.image.includes('images.unsplash.com') &&
      product.image !== PLACEHOLDER_PRODUCT_IMAGE;

    const enhancedProduct: Product = {
      ...product,
      is_user_uploaded: isCustomUpload,
      productColor: visual.productColor || product.productColor || 'Pristine White',
      productFinish: visual.productFinish || product.productFinish || 'Glossy Finish',
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === enhancedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === enhancedProduct.id ? enhancedProduct : p));
      }
      return [enhancedProduct, ...prev];
    });
    upsertProductToSupabase(enhancedProduct);
  };

  const handleUpdateProductPhoto = async (productId: string, newImageUrl: string) => {
    let updatedProd: Product | undefined;
    const target = products.find((p) => p.id === productId);
    let visual: any = {};
    try {
      visual = await analyzeProductPhoto(newImageUrl, { name: target?.name, category: target?.category });
    } catch {}

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProd = {
            ...p,
            image: newImageUrl,
            is_user_uploaded: true,
            productColor: visual.productColor || p.productColor,
            productFinish: visual.productFinish || p.productFinish,
            updatedAt: new Date().toISOString(),
          };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleRemoveProductPhoto = (productId: string) => {
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProd = { ...p, image: PLACEHOLDER_PRODUCT_IMAGE, is_user_uploaded: false, updatedAt: new Date().toISOString() };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleUpdateStockQuantity = (productId: string, newQuantity: number) => {
    const qty = Math.max(0, newQuantity);
    let updatedProd: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProd = {
            ...p,
            stockQuantity: qty,
            inStock: qty > 0,
            updatedAt: new Date().toISOString(),
          };
          return updatedProd;
        }
        return p;
      })
    );
    if (updatedProd) {
      upsertProductToSupabase(updatedProd);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setProductToDelete(found);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      deleteProductFromSupabase(productId);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const prodId = productToDelete.id;
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    setProductToDelete(null);
    try {
      await deleteProductFromSupabase(prodId);
    } catch (err) {
      console.warn('Error deleting product from Supabase:', err);
    }
  };

  // Handlers for Reviews
  const handleToggleReviewVisibility = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, visibleOnWeb: !r.visibleOnWeb } : r
      )
    );
  };

  const handleSaveReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Handlers for Tickets
  const handleUpdateTicketStatus = (ticketId: string, status: ServiceTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const handleSaveTicket = (ticket: ServiceTicket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  // Handlers for Spare Parts
  const handleUpdatePartStock = (partId: string, delta: number) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id === partId) {
          const newQty = Math.max(0, p.stock + delta);
          return {
            ...p,
            stock: newQty,
            reorderStatus: newQty <= p.minStock ? 'low' : 'optimal',
          };
        }
        return p;
      })
    );
  };

  const handleAddPart = (part: SparePart) => {
    setSpareParts((prev) => [part, ...prev]);
  };

  // Urgent leads count
  const pendingLeads = leads.filter((l) => l.status === 'new');
  const urgentTickets = tickets.filter((t) => t.status === 'scheduled');

  // Dedicated Product Detail view
  if (currentScreen === 'product-detail') {
    return (
      <ProductDetailView
        product={selectedProductForDetail}
        allProducts={products}
        settings={settings}
        onBackToCatalog={() => setCurrentScreen('home')}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
        onEnquireProduct={(p) => {
          const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hello Aqua Puro Zone Tumakuru, I want to enquire about ${p.name} (₹${p.price}). Please share installation details & technician demo.`
          )}`;
          window.open(waUrl, '_blank');
        }}
        isKannada={isKannada}
        onToggleLanguage={() => setIsKannada((k) => !k)}
      />
    );
  }

  // If in public Customer Storefront mode
  if (currentScreen === 'home') {
    return (
      <CustomerStorefront
        products={products}
        reviews={reviews}
        settings={settings}
        onReturnToAdmin={() => setCurrentScreen('admin-orders')}
        onSubmitLead={handleAddLead}
        onSelectProduct={(p) => {
          setSelectedProductForDetail(p);
          setCurrentScreen('product-detail');
        }}
        isKannada={isKannada}
        onToggleLanguage={() => setIsKannada((k) => !k)}
      />
    );
  }

  // If in Client Orders (Supabase Realtime) mode
  if (currentScreen === 'admin-orders') {
    return (
      <ProtectedRoute onReturnToStorefront={() => setCurrentScreen('home')}>
        <OrdersDashboard
          onReturnToStorefront={() => setCurrentScreen('home')}
          whatsappNumber={settings.whatsappNumber}
        />
      </ProtectedRoute>
    );
  }

  // Admin and operations layout (Protected)
  return (
    <ProtectedRoute onReturnToStorefront={() => setCurrentScreen('home')}>
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          isKannada={isKannada}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            <Sidebar
              currentScreen={currentScreen}
              onNavigate={(screen) => {
                setCurrentScreen(screen);
                setIsMobileSidebarOpen(false);
              }}
              isKannada={isKannada}
            />
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          whatsappNumber={settings.whatsappNumber}
          dispatchPhone={settings.helplinePhone}
          isKannada={isKannada}
          unreadCount={pendingLeads.length}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onNavigateToStorefront={() => setCurrentScreen('home')}
          onNavigateToAiLibrary={() => setCurrentScreen('admin-ai-library')}
        />

        <main className="w-full pt-20 p-4 sm:p-6 lg:p-8 flex-1 max-w-[1520px] mx-auto">
          {currentScreen === 'admin-dashboard' && (
            <AdminOverview
              leads={leads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onUpdateLeadNotes={handleUpdateLeadNotes}
              onSelectPhotoLead={(lead) => setPhotoLead(lead)}
              products={products}
              onToggleProductStock={handleToggleProductStock}
              onToggleProductVisibility={handleToggleProductVisibility}
              onToggleProductFeatured={handleToggleProductFeatured}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onOpenAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onUpdateProductPhoto={handleUpdateProductPhoto}
              onRemoveProductPhoto={handleRemoveProductPhoto}
              onViewProductDetail={(p) => {
                setSelectedProductForDetail(p);
                setCurrentScreen('product-detail');
              }}
              onUpdateStockQuantity={handleUpdateStockQuantity}
              reviews={reviews}
              onToggleReviewVisibility={handleToggleReviewVisibility}
              onDeleteReview={handleDeleteReview}
              onOpenAddReview={() => setIsReviewModalOpen(true)}
              settings={settings}
              onSaveSettings={(s) => setSettings(s)}
              isKannada={isKannada}
              onToggleLanguage={() => setIsKannada((k) => !k)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onNavigateToStorefront={() => setCurrentScreen('home')}
              onNavigateToAiLibrary={() => setCurrentScreen('admin-ai-library')}
              unreadCount={pendingLeads.length}
            />
          )}

          {currentScreen === 'admin-products' && (
            <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd]">
              <ProductManagementDashboard
                products={products}
                onOpenAddProduct={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                onEditProduct={(p) => {
                  setProductToEdit(p);
                  setIsProductModalOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onToggleProductVisibility={handleToggleProductVisibility}
                onToggleProductStock={handleToggleProductStock}
                onUpdateProductPhoto={handleUpdateProductPhoto}
                onRemoveProductPhoto={handleRemoveProductPhoto}
                onViewProductDetail={(p) => {
                  setSelectedProductForDetail(p);
                  setCurrentScreen('product-detail');
                }}
                onUpdateStockQuantity={handleUpdateStockQuantity}
                onNavigateToAiLibrary={() => setCurrentScreen('admin-ai-library')}
                isKannada={isKannada}
              />
            </div>
          )}

          {currentScreen === 'admin-ai-library' && (
            <AiImageLibrary isKannada={isKannada} />
          )}

          {currentScreen === 'service-tickets-and-amc' && (
            <ServiceQueueView
              tickets={tickets}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onOpenCreateTicket={() => setIsServiceModalOpen(true)}
              isKannada={isKannada}
            />
          )}

          {currentScreen === 'inventory-and-appliances' && (
            <StockInventoryView
              spareParts={spareParts}
              products={products}
              onUpdatePartStock={handleUpdatePartStock}
              onAddPart={handleAddPart}
              onUpdateProductPhoto={handleUpdateProductPhoto}
              onRemoveProductPhoto={handleRemoveProductPhoto}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsProductModalOpen(true);
              }}
              isKannada={isKannada}
            />
          )}

          {currentScreen === 'tech-stack-and-architecture' && (
            <SqlArchitectureHub
              leads={leads}
              products={products}
              tickets={tickets}
              spareParts={spareParts}
              isKannada={isKannada}
            />
          )}

          {currentScreen === 'snap-and-suggest-ai' && (
            <AiDiagnosticsEngine
              onAddLead={(newLead) => {
                handleAddLead(newLead);
                setCurrentScreen('admin-dashboard');
              }}
              isKannada={isKannada}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {photoLead && (
        <PhotoPreviewModal
          lead={photoLead}
          onClose={() => setPhotoLead(null)}
          isKannada={isKannada}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSave={handleSaveProduct}
          productToEdit={productToEdit}
          isKannada={isKannada}
        />
      )}

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSave={handleSaveReview}
          isKannada={isKannada}
        />
      )}

      {isServiceModalOpen && (
        <ServiceTicketModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleSaveTicket}
          isKannada={isKannada}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          pendingLeads={pendingLeads}
          urgentTickets={urgentTickets}
          onSelectLead={(l) => {
            setPhotoLead(l);
            setCurrentScreen('admin-dashboard');
          }}
          isKannada={isKannada}
        />
      )}

      {productToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(productToDelete)}
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleConfirmDeleteProduct}
          isKannada={isKannada}
        />
      )}
    </div>
  </ProtectedRoute>
);
}
