import { MemberExperience } from '@/components/member/MemberExperience';
import { resolvePostPurchaseCapabilities } from '@/lib/commerce/post-purchase-policy';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';

export const metadata = {
  title: 'Aftercare | CARLOPHILLIPS',
  description:
    'Order status, support, returns, fit memory and post-purchase care from CARLOPHILLIPS.',
};

export default function MemberPage() {
  return (
    <MemberExperience
      capabilities={resolvePostPurchaseCapabilities(
        process.env,
        getCommerceEnvironment()
      )}
    />
  );
}
