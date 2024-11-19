import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  TextField,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();

  // Check if cart attribute updates are allowed
  if (!instructions.attributes.canUpdateAttributes) {
    return (
      <Banner title="Account Creation" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  return (
    <BlockStack border={"dotted"} padding={"tight"} spacing="base">
      <Banner title="Account Creation">
        {translate("Create your account below to enjoy exclusive benefits.")}
      </Banner>

      <TextField
        label={translate("Password")}
        type="password"
        placeholder="Enter a secure password"
        onChange={(password) => onPasswordChange(password)}
      />
    </BlockStack>
  );

  async function onPasswordChange(password) {
    // Save the password as a cart attribute
    const result = await applyAttributeChange({
      key: "accountPassword",
      type: "updateAttribute",
      value: password,
    });

    if (result.type === "error") {
      console.error("Error saving password:", result.message);
    } else {
      console.log("Password saved successfully:", password);
    }
  }
}
