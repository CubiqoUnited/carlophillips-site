import { MemberExperience } from '@/components/member/MemberExperience';
import { resolvePostPurchaseCapabilities } from '@/lib/commerce/post-purchase-policy';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';

export const metadata = {
  title: 'Aftercare | CARLOPHILLIPS',
  description: 'Order status, support, returns and post-purchase care.',
};

export default function AftercarePage() {
  return (
    <MemberExperience
      capabilities={resolvePostPurchaseCapabilities(
        process.env,
        getCommerceEnvironment()
      )}
    />
  );
}
