/**
 * ConfirmDialog Component
 * Modal confirmation dialog for destructive actions
 * Prevents accidental deletions
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor,
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  const getConfirmColor = () => {
    if (confirmColor) return confirmColor;
    return destructive ? COLORS.error : COLORS.primary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: getConfirmColor() },
              ]}
              onPress={() => {
                onConfirm();
                onCancel(); // Close dialog
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#ffffff',
  },
});

/**
 * Usage:
 *
 * const [confirmVisible, setConfirmVisible] = useState(false);
 *
 * <ConfirmDialog
 *   visible={confirmVisible}
 *   title="Delete Session?"
 *   message="This will permanently delete the session and all messages"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   destructive={true}
 *   onConfirm={() => handleDelete(sessionId)}
 *   onCancel={() => setConfirmVisible(false)}
 * />
 */
