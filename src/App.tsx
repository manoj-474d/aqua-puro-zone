/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { OrdersDashboard } from './components/admin/OrdersDashboard';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

import {
  INITIAL_LEADS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_SPARE_PARTS,
} from './data/initialData';
import { Lead, Product, Review, StoreSettings, ServiceTicket, SparePart, LeadStatus } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isKannada, setIsKannada] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Core collections
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_SERVICE_TICKETS);
  const [spareParts, setSpareParts] = useState<SparePart[]>(INITIAL_SPARE_PARTS);

  // Modals state
  const [photoLead, setPhotoLead] = useState<Lead | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
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

  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  // Handlers for Products
  const handleToggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const handleToggleProductVisibility = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, visibleOnStorefront: !p.visibleOnStorefront } : p))
    );
  };

  const handleToggleProductFeatured = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, featured: !p.featured } : p))
    );
  };

  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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

  // If in public Customer Storefront mode
  if (currentScreen === 'home') {
    return (
      <CustomerStorefront
        products={products}
        reviews={reviews}
        settings={settings}
        onReturnToAdmin={() => setCurrentScreen('admin-orders')}
        onSubmitLead={handleAddLead}
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

  // Admin and operations layout
  return (
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
              unreadCount={pendingLeads.length}
            />
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
    </div>
  );
}
