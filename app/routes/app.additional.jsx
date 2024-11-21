import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  Button,
  Spinner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useState } from "react";

export default function AdditionalPage() {
  const appBridge = useAppBridge();
  const fetch = authenticatedFetch(appBridge);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  // Function to register the webhook
  const registerWebhook = async () => {
    setIsRegistering(true);
    setRegistrationMessage("");

    try {
      const response = await fetch("/api/webhooks/register", {
        method: "POST",
      });

      if (response.ok) {
        setRegistrationMessage("Webhook registered successfully!");
      } else {
        const error = await response.json();
        setRegistrationMessage(`Failed to register webhook: ${error.message}`);
      }
    } catch (error) {
      setRegistrationMessage(`Error: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                This page demonstrates how to register webhooks programmatically
                in your Shopify app. Use the button below to register the
                `orders/create` webhook.
              </Text>
              <Button onClick={registerWebhook} disabled={isRegistering}>
                {isRegistering ? (
                  <Spinner size="small" />
                ) : (
                  "Register Webhook"
                )}
              </Button>
              {registrationMessage && (
                <Text as="p" variant="bodyMd" color="critical">
                  {registrationMessage}
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/webhooks"
                    target="_blank"
                    removeUnderline
                  >
                    Webhooks documentation
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
