'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import Filter from '@/components/storefront/filter';
import { product, shop, variant } from '@prisma/client';
import { FilterOption, User } from '@/lib/types';
import Pagination from '../shared/pagination';
import ProductCard from '../shared/product-card/productCard';
import { getFilteredVendors, getPaginatedProducts } from './actions';
import { getShopNames } from '../admin/admin/actions';
import useStoreFrontQueryParams from '@/lib/hooks';
import { SortOption } from '@/lib/product/filter/buildClause';
import Button from '../ui/button';
import ProductCardSkeleton from '../shared/product-card/productCardSkeleton';
import QuickLinksSelect from './quickLinks';
import {
  OneColumnIcon,
  TwoColumnIcon,
} from '../shared/product-card/gridColSelectionIcons';

type ImageJson = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

interface StorePriceInfo {
  shopId: number;
  shopName: string;
  state: string;
  cheapestPrice: number | null;
  variants: variant[];
}

export interface ExtendedProduct extends product {
  shop: shop;
  variants?: variant[];
  image: ImageJson | null;
  allStorePrices?: StorePriceInfo[];
}

interface StorefrontProps {
  user: User | null;
}

type MobileGridColumnsOption = 1 | 2;

export default function Storefront({ user }: StorefrontProps) {
  const { queryParams, setQueryParams } = useStoreFrontQueryParams();
  const [filters, setFilters] = useState<FilterOption>(queryParams.filters);
  const [sortOption, setSortOption] = useState<SortOption>(
    queryParams.sortOption as SortOption
  );
  const [currentPage, setCurrentPage] = useState<number>(queryParams.page);

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allShops, setAllShops] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();

  const [isMobileUA, setIsMobileUA] = useState<boolean | undefined>(undefined);
  const [filtersVisibleOnMobile, setFiltersVisibleOnMobile] =
    useState<boolean>(false);

  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [mobileGridColumns, setMobileGridColumns] = useState<
    MobileGridColumnsOption | undefined
  >(undefined);

  useEffect(() => {
    if (isMobileUA === undefined) return;
    if (!isMobileUA) {
      setMobileGridColumns(undefined);
      return;
    }

    const saved = localStorage.getItem('storefront.mobileGridColumns');
    if (saved === '1' || saved === '2') {
      setMobileGridColumns(Number(saved) as MobileGridColumnsOption);
    } else {
      setMobileGridColumns(2);
    }
  }, [isMobileUA]);

  useEffect(() => {
    if (isMobileUA && mobileGridColumns !== undefined) {
      localStorage.setItem(
        'storefront.mobileGridColumns',
        String(mobileGridColumns)
      );
    }
  }, [isMobileUA, mobileGridColumns]);

  // show button after user scrolls ~300px
  useEffect(() => {
    const handleWindowScroll = () => {
      const hasScrolledDown = window.scrollY > 300;
      setShowScrollToTop(hasScrolledDown);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll(); // run once on mount to set initial state

    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobileRegex = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i;
    setIsMobileUA(mobileRegex.test(ua));
  }, []);

  useEffect(() => {
    setQueryParams({ filters, sortOption, page: currentPage });
  }, [filters, sortOption, currentPage, setQueryParams]);

  const loadProducts = useCallback(
    (page: number) => {
      startTransition(async () => {
        let limit = 40;
        if (isMobileUA) limit = limit - 20;

        const data = await getPaginatedProducts(
          page,
          limit,
          filters,
          sortOption
        );
        const transformed: ExtendedProduct[] = data.mergedProducts.map((p) => ({
          ...p,
          image: p.image as ImageJson | null, // TODO: Why are we doing this the types are f'ed anyway
        }));
        setProducts(transformed);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      });
    },
    [filters, sortOption, isMobileUA]
  );

  // Always reset to first page when filters or sort changes
  useEffect(() => {
    loadProducts(1);
  }, [filters, sortOption, loadProducts]);

  useEffect(() => {
    const loadVendors = async () => {
      const filteredVendors = await getFilteredVendors(filters);
      setAllBrands(
        filteredVendors.map(({ vendor, count }) => `${vendor} (${count})`)
      );
    };
    loadVendors();
  }, [filters]);

  useEffect(() => {
    const loadShopNames = async () => {
      const shopNames = await getShopNames();
      setAllShops(shopNames);
    };
    loadShopNames();
  }, []);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (newFilters: FilterOption) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const toggleMobileFilters = () => setFiltersVisibleOnMobile((prev) => !prev);

  const handleQuickLinkSelect = useCallback(
    (filterChanges: Partial<FilterOption>, newSort?: SortOption) => {
      const newFilters: FilterOption = Object.fromEntries(
        Object.entries(filterChanges).filter(([, value]) => value !== undefined)
      ) as FilterOption;

      setFilters(newFilters);
      setSortOption(newSort ?? sortOption);
      setCurrentPage(1);

      setQueryParams({
        filters: newFilters,
        sortOption: newSort ?? sortOption,
        page: 1,
      });
    },
    [sortOption, setQueryParams]
  );

  const handleScrollToTopClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileGridColumnsChange = (
    desiredColumns: MobileGridColumnsOption
  ) => {
    setMobileGridColumns(desiredColumns);
  };

  const mobileCols = mobileGridColumns ?? 2;
  const gridClassName =
    mobileCols === 1
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';

  return (
    <div className="p-6 mt-1 bg-gray-100">
      <div className="flex flex-col space-y-1 mb-3">
        {isMobileUA && (
          <div className="flex gap-4 items-center mb-2">
            <Button variant="smart" onClick={toggleMobileFilters}>
              {filtersVisibleOnMobile ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <QuickLinksSelect onSelect={handleQuickLinkSelect} />
          </div>
        )}

        {(!isMobileUA || filtersVisibleOnMobile) && (
          <div className="sm:mb-10">
            <Filter
              onFilterChange={handleFilterChange}
              allBrands={allBrands}
              allShops={allShops}
              initialFilters={queryParams.filters}
              onSortChange={handleSortChange}
              sortOption={sortOption}
            />
          </div>
        )}
        <div className="flex items-center justify-between h-6 ml-auto gap-3">
          {isMobileUA && (
            <div className="flex items-center gap-2">
              <Button
                variant="smart"
                onClick={() => handleMobileGridColumnsChange(1)}
                aria-pressed={mobileGridColumns === 1}
                className={mobileGridColumns === 1 ? 'ring-1 ring-black' : ''}
                title="Show 1 item per row"
              >
                <OneColumnIcon />
              </Button>
              <Button
                variant="smart"
                onClick={() => handleMobileGridColumnsChange(2)}
                aria-pressed={mobileGridColumns === 2}
                className={mobileGridColumns === 2 ? 'ring-1 ring-black' : ''}
                title="Show 2 items per row"
              >
                <TwoColumnIcon />
              </Button>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {isPending ? (
        <div className={gridClassName}>
          {Array.from({ length: 10 }).map((unusedItem, itemIndex) => (
            <ProductCardSkeleton key={itemIndex} />
          ))}
        </div>
      ) : (
        <div className={gridClassName}>
          {products.map((productItem) => (
            <ProductCard
              key={productItem.id}
              admin={Boolean(user?.admin)}
              product={productItem}
            />
          ))}
        </div>
      )}

      <div className="flex mt-3 w-full justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {isMobileUA && showScrollToTop && (
        <Button
          variant="smart"
          onClick={handleScrollToTopClick}
          className="fixed bottom-4 right-4 z-50 shadow-md"
          aria-label="Scroll to top"
        >
          Scroll to top
        </Button>
      )}
    </div>
  );
}
