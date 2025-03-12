import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert,
    Share,
    TouchableWithoutFeedback, // Import TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { addNote, deleteNote, updateNote, getNoteById } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAGS } from '../constants/constants';

const { width } = Dimensions.get('window');

// Get tag details by ID
const getTagById = (tagId) => {
    return TAGS.find(tag => tag.id === tagId) || TAGS[0];
};

const NotesScreen = ({ route, navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { id } = route.params || {};
    const insets = useSafeAreaInsets();

    // State for loaded note data
    const [noteData, setNoteData] = useState(null);
    const [isEditing, setIsEditing] = useState(!id);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date());
    const [selectedTag, setSelectedTag] = useState('personal');
    const [showOptions, setShowOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);
    const [titleFocused, setTitleFocused] = useState(false);
    const [contentFocused, setContentFocused] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fabAnim = useRef(new Animated.Value(1)).current;

    // Refs
    const titleInputRef = useRef(null);
    const contentInputRef = useRef(null);
    const autoSaveTimeout = useRef(null);

    // Settings
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [autoSaveInterval, setAutoSaveInterval] = useState(3000);

    // Load the note asynchronously if an ID is provided
    useEffect(() => {
        const loadNote = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    const data = await getNoteById(id);
                    if (data) {
                        setNoteData(data);
                    } else {
                        // Handle note not found, go back to previous screen
                        navigation.goBack();
                    }
                } catch (error) {
                    console.error('Failed to load note:', error);
                    // Optionally navigate back or show an error message
                    navigation.goBack(); // Go back on error as well
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadNote();
    }, [id, navigation]);

    // Update state once noteData is loaded
    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title || '');
            setContent(noteData.content || '');
            setDate(noteData.date ? new Date(noteData.date) : new Date());
            setSelectedTag(noteData.tag || 'personal');
        }
    }, [noteData]);

    // Load auto-save setting from AsyncStorage
    useEffect(() => {
        const loadAutoSaveSettings = async () => {
            try {
                const enabled = await AsyncStorage.getItem('autoSaveEnabled');
                const interval = await AsyncStorage.getItem('autoSaveInterval');

                setAutoSaveEnabled(enabled === null ? true : enabled === 'true');
                setAutoSaveInterval(interval ? parseInt(interval) : 3000);
            } catch (error) {
                console.error('Failed to load autoSave settings:', error);
            }
        };

        loadAutoSaveSettings();
    }, []);

    // Handle keyboard visibility animations
    useEffect(() => {
        if (titleFocused || contentFocused) {
            // Keyboard is shown, hide the FAB
            Animated.timing(fabAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            // Keyboard is hidden, show the FAB
            Animated.timing(fabAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [titleFocused, contentFocused, fabAnim]);

    // Setup auto-save
    useEffect(() => {
        if (autoSaveEnabled && isEditing && (title || content)) {
            clearTimeout(autoSaveTimeout.current); // Clear previous timeout if exists
            autoSaveTimeout.current = setTimeout(() => {
                handleAutoSave();
            }, autoSaveInterval);
        }

        return () => {
            clearTimeout(autoSaveTimeout.current); // Clear timeout on unmount
        };
    }, [title, content, isEditing, autoSaveEnabled, autoSaveInterval, handleAutoSave]); // Added handleAutoSave to dependencies

    const formattedDate = () => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    const saveNoteToDatabase = async (noteToSave) => {
        setIsSaving(true); // Indicate saving process
        try {
            if (noteData?.id) {
                return await updateNote(noteData.id, {
                    title: noteToSave.title,
                    content: noteToSave.content,
                    tag: noteToSave.tag,
                    date: noteToSave.date
                });
            } else {
                return await addNote(
                    noteToSave.title,
                    noteToSave.content,
                    noteToSave.tag,
                    noteToSave.date
                );
            }
        } catch (error) {
            console.error('Failed to save note to database:', error);
            // Optionally show an error message to the user
        } finally {
            setIsSaving(false); // End saving process regardless of outcome
        }
    };


    const handleAutoSave = useCallback(async () => {
        if (!autoSaveEnabled || !isEditing || (!title && !content)) {
            return; // Exit early if auto-save conditions not met
        }

        try {
            const currentDate = new Date();
            setDate(currentDate);

            const noteToSave = {
                id: noteData?.id, // Keep existing ID for updates
                title: title.trim() === '' ? 'Untitled Note' : title,
                content,
                date: currentDate.toISOString(),
                tag: selectedTag,
            };

            const savedNote = await saveNoteToDatabase(noteToSave);
            if (savedNote) {
                setNoteData(savedNote); // Update noteData with saved note, important for new notes to get ID
            }
        } catch (error) {
            console.error('Failed to auto-save note:', error);
        }
    }, [autoSaveEnabled, isEditing, noteData, title, content, selectedTag, saveNoteToDatabase]); // Added saveNoteToDatabase to dependencies


    const toggleOptions = () => {
        if (showOptions) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true })
            ]).start(() => setShowOptions(false));
        } else {
            setShowOptions(true);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
            ]).start();
        }
    };


    // Manual save handler
    const handleSave = useCallback(async () => {
        try {
            const currentDate = new Date();
            setDate(currentDate);

            const noteToSave = {
                title: title.trim() === '' ? 'Untitled Note' : title,
                content,
                tag: selectedTag,
                date: currentDate.toISOString()
            };

            const savedNote = await saveNoteToDatabase(noteToSave);
            if (savedNote) {
                setNoteData(savedNote);
                setIsEditing(false);

                if (!id) {
                    // Navigate back if this was a new note creation
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error('Failed to save note', error);
            // Optionally show an error message to the user
        }
    }, [noteData, title, content, selectedTag, navigation, id, saveNoteToDatabase]); // Added saveNoteToDatabase to dependencies


    // Delete note handler with confirmation
    const handleDelete = useCallback(async () => {
        Alert.alert(
            "Delete Note",
            "Are you sure you want to delete this note?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: async () => {
                        if (noteData?.id) {
                            try {
                                await deleteNote(noteData.id);
                                navigation.goBack();
                            } catch (error) {
                                console.error('Failed to delete note', error);
                                // Optionally show an error message
                            }
                        } else {
                            navigation.goBack(); // If no ID, just go back (new note not saved)
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    }, [noteData, navigation]);

    const handleShare = useCallback(async () => {
        toggleOptions(); // Close options after share is pressed
        try {
            await Share.share({
                message: `${title.trim() === '' ? 'Untitled Note' : title}\n\n${content}`,
            });
        } catch (error) {
            if (error.message !== 'User did not share') { // Ignore user cancellation
                alert(`Sharing failed: ${error.message}`);
            }
        }
    }, [title, content]);


    const renderOptionsModal = () => {
        if (!showOptions) return null;

        return (
            <Animated.View
                style={[
                    styles.optionsModal,
                    {
                        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleShare}
                    accessibilityLabel="Share note"
                >
                    <Feather name="share-2" size={22} color={theme.textColor} />
                    <Text style={[styles.optionText, { color: theme.textColor }]}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleDelete}
                    accessibilityLabel="Delete note"
                >
                    <Feather name="trash-2" size={22} color={theme.textColor} />
                    <Text style={[styles.optionText, { color: theme.textColor }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={toggleOptions}
                    accessibilityLabel="Close options"
                >
                    <Feather name="x" size={22} color={theme.textColor} />
                    <Text style={[styles.optionText, { color: theme.textColor }]}>Close</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };


    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, {
                backgroundColor: theme.background,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textColor }]}>
                    Loading note...
                </Text>
            </View>
        );
    }

    // Get the current tag object
    const currentTag = getTagById(selectedTag);

    return (
        <View style={[styles.container, {
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom
        }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
            />

            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.97)' : 'rgba(255, 255, 255, 0.97)',
                borderBottomColor: theme.borderColor,
            }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    accessibilityLabel="Go back"
                >
                    <Feather name="arrow-left" size={24} color={theme.textColor} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity
                                style={[styles.saveButton, {
                                    backgroundColor: theme.primary,
                                    opacity: isSaving ? 0.7 : 1
                                }]}
                                onPress={handleSave}
                                disabled={isSaving}
                                accessibilityLabel="Save note"
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Feather name="save" size={16} color="white" />
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => setIsEditing(true)}
                                accessibilityLabel="Edit note"
                            >
                                <Feather name="edit-2" size={22} color={theme.textColor} />
                            </TouchableOpacity>


                        </>
                    )}

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleOptions}
                        accessibilityLabel="More options"
                    >
                        <Feather name="more-vertical" size={24} color={theme.textColor} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Overlay to disable interaction when options modal is open */}
            {showOptions && (
                <TouchableWithoutFeedback onPress={toggleOptions}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}


            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="interactive"
                >
                    {!isEditing && (
                        <View style={styles.metaContainer}>
                            <Text style={[styles.date, { color: theme.secondaryTextColor }]}>
                                {formattedDate()}
                            </Text>
                            <View
                                style={[
                                    styles.categoryBadge,
                                    { backgroundColor: currentTag.color }
                                ]}
                            >
                                <Ionicons name={currentTag.icon} size={14} color="white" />
                                <Text style={styles.categoryText}>
                                    {currentTag.name}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isEditing && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categorySelector}
                            contentContainerStyle={styles.categorySelectorContent}
                        >
                            {TAGS.map(tag => (
                                <TouchableOpacity
                                    key={tag.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedTag === tag.id
                                            ? { backgroundColor: tag.color }
                                            : {
                                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                borderColor: tag.color,
                                                borderWidth: 1
                                            }
                                    ]}
                                    onPress={() => setSelectedTag(tag.id)}
                                    accessibilityLabel={`Select ${tag.name} category`}
                                >
                                    <Ionicons
                                        name={tag.icon}
                                        size={16}
                                        color={selectedTag === tag.id ? "white" : tag.color}
                                    />
                                    <Text style={[
                                        styles.categoryItemText,
                                        { color: selectedTag === tag.id ? "white" : tag.color }
                                    ]}>
                                        {tag.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {isEditing ? (
                        <>
                            <TextInput
                                ref={titleInputRef}
                                style={[
                                    styles.titleInput,
                                    {
                                        color: theme.textColor,
                                        borderBottomColor: titleFocused ? theme.primary : 'transparent',
                                        borderBottomWidth: titleFocused ? 2 : 0,
                                    }
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Note title"
                                placeholderTextColor={theme.tertiaryTextColor}
                                selectionColor={theme.primary}
                                maxLength={100}
                                onFocus={() => setTitleFocused(true)}
                                onBlur={() => setTitleFocused(false)}
                                returnKeyType="next"
                                onSubmitEditing={() => contentInputRef.current?.focus()}
                            />
                            <TextInput
                                ref={contentInputRef}
                                style={[
                                    styles.contentInput,
                                    {
                                        color: theme.textColor,
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                    }
                                ]}
                                value={content}
                                onChangeText={setContent}
                                placeholder="Type your note here..."
                                placeholderTextColor={theme.tertiaryTextColor}
                                multiline
                                textAlignVertical="top"
                                selectionColor={theme.primary}
                                autoFocus={!id}
                                onFocus={() => setContentFocused(true)}
                                onBlur={() => setContentFocused(false)}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={[styles.titleDisplay, { color: theme.textColor }]}>
                                {title.trim() === '' ? 'Untitled Note' : title}
                            </Text>
                            <Text style={[styles.contentText, { color: theme.textColor }]}>
                                {content.trim() === '' ? 'No content' : content}
                            </Text>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Floating Action Button */}
            {!isEditing && (
                <Animated.View
                    style={[
                        styles.fabContainer,
                        {
                            opacity: fabAnim,
                            transform: [
                                { scale: fabAnim },
                                {
                                    translateY: fabAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }
                            ],
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: theme.primary }]}
                        onPress={() => setIsEditing(true)}
                        activeOpacity={0.8}
                        accessibilityLabel="Edit note"
                    >
                        <Feather name="edit-2" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {renderOptionsModal()}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    keyboardAvoid: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderBottomWidth: 1,
        elevation: 0,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    date: {
        fontSize: 14
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    categorySelector: {
        marginTop: 16,
        marginBottom: 20,
        maxHeight: 50
    },
    categorySelectorContent: {
        paddingRight: 20
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        height: 36,
    },
    categoryItemText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8
    },
    titleDisplay: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24
    },
    contentText: {
        fontSize: 16,
        lineHeight: 26
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 0,
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 300,
        padding: 16,
        borderRadius: 12,
        textAlignVertical: 'top',
    },
    fabContainer: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    optionsModal: {
        position: 'absolute',
        right: 10,
        top: 80,
        width: 120,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 300,
        zIndex: 200, // Increased zIndex to be above overlay
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    optionItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 100, 
    },
});

export default NotesScreen;