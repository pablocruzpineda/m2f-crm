import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, WorkspaceProvider, ThemeProvider } from '@/app/providers';
import { QueryProvider } from '@/app/providers/QueryProvider.js';
import { LoginPage } from '@/pages/auth/login';
import { SignupPage } from '@/pages/auth/signup';
import { DashboardPage } from '@/pages/dashboard';
import { ContactsPage, ContactCreatePage, ContactDetailPage, ContactEditPage } from '@/pages/contacts';
import { PipelinePage, DealCreatePage, DealDetailPage, DealEditPage } from '@/pages/pipeline';
import { AppearanceSettingsPage } from '@/pages/settings';
import { MainLayout } from '@/shared/ui/layouts/MainLayout';
import { ProtectedRoute } from '@/shared/ui/protected-route.js';

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ThemeProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes with layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Placeholder routes for navigation items */}
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ContactsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/contacts/new"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ContactCreatePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ContactDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts/:id/edit"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ContactEditPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PipelinePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline/new"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DealCreatePage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DealDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline/:id/edit"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DealEditPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pipelines"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="p-8">
                        <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
                        <p className="text-muted-foreground mt-2">Coming in Phase 5...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="p-8">
                        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AppearanceSettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </ThemeProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App;

