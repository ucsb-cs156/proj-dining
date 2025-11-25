import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateAliasesPage from "main/pages/ModerateAliasesPage";

export default {
  title: "pages/ModerateAliasesPage",
  component: ModerateAliasesPage,
};

const Template = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateAliasesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export const Default = Template.bind({});
