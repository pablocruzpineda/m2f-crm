import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, WorkspaceProvider, ThemeProvider } from '@/app/providers';
import { QueryProvider } from '@/app/providers/QueryProvider.js';
import { LoginPage } from '@/pages/auth/login';
import { SignupPage } from '@/pages/auth/signup';
import { DashboardPage } from '@/pages/dashboard';
import { ContactsPage, ContactCreatePage, ContactDetailPage, ContactEditPage } from '@/pages/contacts';
import { PipelinePage, DealCreatePage, DealDetailPage, DealEditPage } from '@/pages/pipeline';
import { AppearanceSettingsPage, ProfileSettingsPage } from '@/pages/settings';
import { TeamMembersPage } from '@/pages/settings/team/TeamMembersPage';
import { ChatPage, ChatSettingsPage } from '@/pages/chat';
import { ActivityFeedPage } from '@/pages/activity';
import { AcceptInvitationPage } from '@/pages/accept-invitation/AcceptInvitationPage';
import { CreditsPage, AgentsPage, DevicesPage } from '@/pages/intelligence';
import { MainLayout } from '@/shared/ui/layouts/MainLayout';
import { ProtectedRoute } from '@/shared/ui/protected-route.js';

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ThemeProvider>
              <Toaster position="bottom-right" richColors />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

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
                        <ChatPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chat/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ChatSettingsPage />
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

                <Route
                  path="/settings/profile"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProfileSettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings/team"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <TeamMembersPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ActivityFeedPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Intelligence routes */}
                <Route
                  path="/intelligence/credits"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CreditsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/intelligence/agents"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AgentsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/intelligence/devices"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DevicesPage />
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

