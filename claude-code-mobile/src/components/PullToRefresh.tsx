/**
 * PullToRefresh Component
 * Wrapper for FlatList/ScrollView with pull-to-refresh
 * Provides consistent refresh UX across screens
 */

import React, { ReactNode } from 'react';
import { RefreshControl } from 'react-native';
import { COLORS } from '../constants/theme';

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  tintColor?: string;
  children?: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  tintColor = COLORS.primary,
}) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      colors={[tintColor]} // Android
      progressBackgroundColor={COLORS.card} // Android
    />
  );
};

/**
 * Usage with FlatList:
 *
 * const [refreshing, setRefreshing] = useState(false);
 *
 * const handleRefresh = async () => {
 *   setRefreshing(true);
 *   await loadData();
 *   setRefreshing(false);
 * };
 *
 * <FlatList
 *   data={data}
 *   renderItem={renderItem}
 *   refreshControl={
 *     <PullToRefresh
 *       refreshing={refreshing}
 *       onRefresh={handleRefresh}
 *     />
 *   }
 * />
 *
 * Usage with ScrollView:
 *
 * <ScrollView
 *   refreshControl={
 *     <PullToRefresh
 *       refreshing={refreshing}
 *       onRefresh={handleRefresh}
 *     />
 *   }
 * >
 *   {content}
 * </ScrollView>
 */
