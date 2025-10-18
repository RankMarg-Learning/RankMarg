import { useQuery } from '@tanstack/react-query';
import { promoCodeService, PromoCode } from '@/services/subscription.service';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';

export const usePromoCode = (promoCodeId?: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.subscription.promoCode(promoCodeId || ''),
    queryFn: () => promoCodeService.getPromoCode(promoCodeId || ''),
    enabled: !!promoCodeId,
    ...getQueryConfig('DYNAMIC'),
  });

  return {
    promoCode: data as PromoCode | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};

