/**
 * SavedProfilesSheet — bottom sheet showing saved kundli profiles.
 *
 * Shown before the birth details form when the user has saved profiles.
 * Selecting a profile triggers immediate kundli generation (no form re-entry).
 * "Add new" opens the BirthDetailsForm.
 */

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { colors, getTranslations } from '@upaya/shared';
import type { LocalKundliProfile } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

interface Props {
  visible: boolean;
  profiles: LocalKundliProfile[];
  language: 'hi' | 'en';
  onSelectProfile: (profile: LocalKundliProfile) => void;
  onAddNew: () => void;
  onDismiss: () => void;
}

function relLabel(rel: string, t: ReturnType<typeof getTranslations>): string {
  const bd = t.birthDetails.savedProfiles;
  if (rel === 'self') return bd.relationshipSelf;
  if (rel === 'family') return bd.relationshipFamily;
  if (rel === 'pet') return bd.relationshipPet;
  return rel;
}

function formatDob(iso: string): string {
  // YYYY-MM-DD → DD/MM/YYYY
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function SavedProfilesSheet({
  visible, profiles, language, onSelectProfile, onAddNew, onDismiss
}: Props) {
  const t = getTranslations(language);
  const bd = t.birthDetails.savedProfiles;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss} />
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{bd.title}</Text>
          <Text style={styles.subtitle}>{bd.subtitle}</Text>
        </View>

        {/* Profile list */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.localId}
              style={styles.profileCard}
              onPress={() => onSelectProfile(profile)}
              activeOpacity={0.8}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarEmoji}>
                  {profile.relationship === 'pet' ? '🐾' : profile.relationship === 'self' ? '🙏' : '👨‍👩‍👦'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.personName}</Text>
                <Text style={styles.profileMeta}>
                  {relLabel(profile.relationship, t)} · {formatDob(profile.dateOfBirth)} · {profile.placeOfBirthName}
                </Text>
              </View>
              <Text style={styles.profileArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add new button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addNewButton} onPress={onAddNew} activeOpacity={0.8}>
            <Text style={styles.addNewText}>{bd.addNew}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? hp(32) : hp(16),
  },
  handleBar: {
    width: wp(40),
    height: hp(4),
    backgroundColor: colors.neutral.grey200,
    borderRadius: hp(2),
    alignSelf: 'center',
    marginTop: hp(12),
    marginBottom: hp(4),
  },
  header: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(12),
  },
  title: {
    fontSize: fp(18),
    fontWeight: '700',
    color: colors.secondary.maroon,
  },
  subtitle: {
    fontSize: fp(13),
    color: colors.neutral.grey500,
    marginTop: hp(2),
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: wp(16),
    paddingBottom: hp(8),
    gap: hp(8),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: colors.accent.goldLight,
    borderRadius: wp(12),
  },
  profileAvatar: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.grey100,
  },
  profileAvatarEmoji: {
    fontSize: fp(20),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  profileMeta: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    marginTop: hp(2),
  },
  profileArrow: {
    fontSize: fp(18),
    color: colors.primary.saffron,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: wp(16),
    paddingTop: hp(8),
  },
  addNewButton: {
    paddingVertical: hp(14),
    borderWidth: 1.5,
    borderColor: colors.primary.saffron,
    borderRadius: wp(12),
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  addNewText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.primary.saffronDark,
  },
});
