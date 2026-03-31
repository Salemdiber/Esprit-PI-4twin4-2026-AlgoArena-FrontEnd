import React, { useEffect, useMemo, useState } from 'react';
import {
	Avatar,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Radio,
	RadioGroup,
	Select,
	Spinner,
	Stack,
	Text,
	Textarea,
	useOutsideClick,
	VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';

const MotionBox = motion.create(Box);

const PlusIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<line x1="12" y1="5" x2="12" y2="19" />
		<line x1="5" y1="12" x2="19" y2="12" />
	</svg>
);

const ShareIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
		<polyline points="16 6 12 2 8 6" />
		<line x1="12" y1="2" x2="12" y2="15" />
	</svg>
);

const ImageIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<circle cx="8.5" cy="8.5" r="1.5" />
		<polyline points="21 15 16 10 5 21" />
	</svg>
);

const VideoIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<polygon points="23 7 16 12 23 17 23 7" />
		<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
	</svg>
);

const BellIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
		<path d="M13.73 21a2 2 0 0 1-3.46 0" />
	</svg>
);

const ThumbUpIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.66l1.38-9A2 2 0 0 0 19.69 9H14Z" />
		<path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
	</svg>
);

const ThumbDownIcon = (props) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
		<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.66l-1.38 9A2 2 0 0 0 4.31 15H10Z" />
		<path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
	</svg>
);

const STORAGE_KEYS = {
	notifications: 'community_notifications_v2',
	postReactions: 'community_post_reactions_v2',
	commentReactions: 'community_comment_reactions_v2',
	problemCommentVotes: 'community_problem_comment_votes_v1',
};

const safeReadStorage = (key, fallback) => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
};

const safeWriteStorage = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Ignore local storage write errors.
	}
};

const formatDateTime = (value) => {
	if (!value) return 'Just now';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Just now';
	return date.toLocaleString();
};

const previewContent = (text, limit = 180) => {
	if (!text) return '';
	if (text.length <= limit) return text;
	return `${text.slice(0, limit)}...`;
};

const applyDualReaction = (entry, nextReaction, positiveLabel, negativeLabel) => {
	const base = entry || { [positiveLabel]: 0, [negativeLabel]: 0, userReaction: null };
	const next = {
		[positiveLabel]: base[positiveLabel],
		[negativeLabel]: base[negativeLabel],
		userReaction: base.userReaction,
	};

	if (base.userReaction === nextReaction) {
		next[nextReaction === 'positive' ? positiveLabel : negativeLabel] = Math.max(
			0,
			next[nextReaction === 'positive' ? positiveLabel : negativeLabel] - 1,
		);
		next.userReaction = null;
		return { state: next, applied: false };
	}

	if (base.userReaction === 'positive') {
		next[positiveLabel] = Math.max(0, next[positiveLabel] - 1);
	}

	if (base.userReaction === 'negative') {
		next[negativeLabel] = Math.max(0, next[negativeLabel] - 1);
	}

	if (nextReaction === 'positive') {
		next[positiveLabel] += 1;
	} else {
		next[negativeLabel] += 1;
	}

	next.userReaction = nextReaction;
	return { state: next, applied: true };
};

const CommunityPage = () => {
	const { isLoggedIn, currentUser } = useAuth();

	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [activeSection, setActiveSection] = useState('community');
	const [sortOrder, setSortOrder] = useState('latest');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [postType, setPostType] = useState('normal');
	const [imageFile, setImageFile] = useState(null);
	const [videoFile, setVideoFile] = useState(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState('');
	const [postErrors, setPostErrors] = useState({});
	const [creatingPost, setCreatingPost] = useState(false);

	const [expandedPostIds, setExpandedPostIds] = useState({});
	const [commentInputs, setCommentInputs] = useState({});
	const [commentType, setCommentType] = useState({});
	const [commentErrors, setCommentErrors] = useState({});
	const [commentingPostId, setCommentingPostId] = useState('');
	const [filterType, setFilterType] = useState({});

	const [editingPost, setEditingPost] = useState({ postId: '', title: '', content: '' });
	const [savingPostEditId, setSavingPostEditId] = useState('');
	const [editingComment, setEditingComment] = useState({ postId: '', commentId: '', text: '' });
	const [savingCommentEditKey, setSavingCommentEditKey] = useState('');

	const [shareModal, setShareModal] = useState({ isOpen: false, postId: '', postTitle: '' });
	const [notifications, setNotifications] = useState(() => safeReadStorage(STORAGE_KEYS.notifications, []));
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const [postReactions, setPostReactions] = useState(() => safeReadStorage(STORAGE_KEYS.postReactions, {}));
	const [commentReactions, setCommentReactions] = useState(() => safeReadStorage(STORAGE_KEYS.commentReactions, {}));
	const [problemCommentVotes, setProblemCommentVotes] = useState(() => safeReadStorage(STORAGE_KEYS.problemCommentVotes, {}));

	const notificationRef = React.useRef(null);

	useOutsideClick({
		ref: notificationRef,
		handler: () => setIsNotificationOpen(false),
	});

	useEffect(() => {
		safeWriteStorage(STORAGE_KEYS.notifications, notifications);
	}, [notifications]);

	useEffect(() => {
		safeWriteStorage(STORAGE_KEYS.postReactions, postReactions);
	}, [postReactions]);

	useEffect(() => {
		safeWriteStorage(STORAGE_KEYS.commentReactions, commentReactions);
	}, [commentReactions]);

	useEffect(() => {
		safeWriteStorage(STORAGE_KEYS.problemCommentVotes, problemCommentVotes);
	}, [problemCommentVotes]);

	const loadPosts = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await communityService.getPosts();
			setPosts(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(err.message || 'Failed to load discussions.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPosts();
	}, []);

	const sortedPosts = useMemo(() => {
		const copy = [...posts];
		copy.sort((a, b) => {
			const aDate = new Date(a.createdAt || 0).getTime();
			const bDate = new Date(b.createdAt || 0).getTime();
			return sortOrder === 'latest' ? bDate - aDate : aDate - bDate;
		});
		return copy;
	}, [posts, sortOrder]);

	const sectionPosts = useMemo(() => {
		if (activeSection === 'problems') {
			return sortedPosts.filter((post) => post.type === 'problem');
		}
		return sortedPosts.filter((post) => post.type !== 'problem');
	}, [sortedPosts, activeSection]);

	const unreadNotifications = useMemo(
		() => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
		[notifications],
	);

	const currentUserId = useMemo(
		() => String(currentUser?._id || currentUser?.id || currentUser?.userId || ''),
		[currentUser],
	);

	const isOwner = (authorId) => currentUserId && String(authorId || '') === currentUserId;

	const pushNotification = ({ action, preview }) => {
		const actorName = currentUser?.username || 'Community member';
		const actorAvatar = currentUser?.avatar || '';

		const nextNotification = {
			id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			actorName,
			actorAvatar,
			action,
			preview,
			createdAt: new Date().toISOString(),
			read: false,
		};

		setNotifications((prev) => [nextNotification, ...prev].slice(0, 120));
	};

	const toggleNotifications = () => {
		setIsNotificationOpen((prev) => {
			const next = !prev;
			if (next) {
				setNotifications((current) => current.map((item) => ({ ...item, read: true })));
			}
			return next;
		});
	};

	const validatePostForm = () => {
		const nextErrors = {};
		if (!title.trim()) nextErrors.title = 'Title is required.';
		if (!content.trim()) nextErrors.content = activeSection === 'problems' ? 'Description is required.' : 'Content is required.';
		setPostErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const resetCreateForm = () => {
		setTitle('');
		setContent('');
		setPostType(activeSection === 'problems' ? 'problem' : 'normal');
		setImageFile(null);
		setVideoFile(null);
		setImagePreviewUrl('');
		setPostErrors({});
	};

	useEffect(() => {
		if (activeSection === 'problems') {
			setPostType('problem');
		}
	}, [activeSection]);

	const handleCreateModalClose = () => {
		setIsCreateModalOpen(false);
		resetCreateForm();
	};

	const handleImageSelect = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setImageFile(file);
		setImagePreviewUrl(URL.createObjectURL(file));
	};

	const handleVideoSelect = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setVideoFile(file);
	};

	const handleCreatePost = async (event) => {
		event.preventDefault();

		if (!validatePostForm()) return;
		if (!isLoggedIn) {
			setError('Please sign in to create a post.');
			return;
		}

		try {
			setCreatingPost(true);
			setError('');

			let imageUrl;
			let videoUrl;

			if (activeSection !== 'problems' && imageFile) {
				const imageUpload = await communityService.uploadMedia(imageFile);
				imageUrl = imageUpload?.url;
			}

			if (activeSection !== 'problems' && videoFile) {
				const videoUpload = await communityService.uploadMedia(videoFile);
				videoUrl = videoUpload?.url;
			}

			const created = await communityService.createPost({
				title: title.trim(),
				content: content.trim(),
				type: activeSection === 'problems' ? 'problem' : postType,
				imageUrl,
				videoUrl,
			});

			setPosts((prev) => [created, ...prev]);
			handleCreateModalClose();
		} catch (err) {
			setError(err.message || 'Unable to create post.');
		} finally {
			setCreatingPost(false);
		}
	};

	const togglePostExpanded = (postId) => {
		setExpandedPostIds((prev) => ({
			...prev,
			[postId]: !prev[postId],
		}));
	};

	const handleCommentInputChange = (postId, value) => {
		setCommentInputs((prev) => ({ ...prev, [postId]: value }));
		setCommentErrors((prev) => ({ ...prev, [postId]: '' }));
	};

	const handleAddComment = async (event, postId) => {
		event.preventDefault();

		const text = (commentInputs[postId] || '').trim();
		if (!text) {
			setCommentErrors((prev) => ({ ...prev, [postId]: 'Comment is required.' }));
			return;
		}

		if (!isLoggedIn) {
			setError('Please sign in to comment on posts.');
			return;
		}

		try {
			setCommentingPostId(postId);
			setError('');

			const targetPost = posts.find((post) => post._id === postId);
			const isProblemPost = targetPost?.type === 'problem';

			const updatedPost = await communityService.addComment(postId, {
				text,
				type: isProblemPost ? 'discussion' : (commentType[postId] || 'discussion'),
			});

			setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
			setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
			setCommentType((prev) => ({ ...prev, [postId]: 'discussion' }));
			setExpandedPostIds((prev) => ({ ...prev, [postId]: true }));
			pushNotification({
				action: 'commented on your post',
				preview: text.length > 110 ? `${text.slice(0, 110)}...` : text,
			});
		} catch (err) {
			setError(err.message || 'Unable to add comment.');
		} finally {
			setCommentingPostId('');
		}
	};

	const handleStartPostEdit = (post) => {
		setEditingPost({ postId: post._id, title: post.title || '', content: post.content || '' });
	};

	const handleCancelPostEdit = () => {
		setEditingPost({ postId: '', title: '', content: '' });
	};

	const handleSavePostEdit = async (postId) => {
		const trimmedTitle = editingPost.title.trim();
		const trimmedContent = editingPost.content.trim();

		if (!trimmedTitle || !trimmedContent) {
			setError('Title and content are required.');
			return;
		}

		try {
			setSavingPostEditId(postId);
			setError('');
			const updatedPost = await communityService.updatePost(postId, {
				title: trimmedTitle,
				content: trimmedContent,
			});
			setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
			handleCancelPostEdit();
		} catch (err) {
			setError(err.message || 'Unable to modify post.');
		} finally {
			setSavingPostEditId('');
		}
	};

	const getCommentKey = (postId, comment) => {
		if (comment._id) return `${postId}:${comment._id}`;
		return `${postId}:${comment.createdAt || comment.text?.slice(0, 24) || 'comment'}`;
	};

	const handleStartCommentEdit = (postId, comment) => {
		setEditingComment({ postId, commentId: comment._id || '', text: comment.text || '' });
	};

	const handleCancelCommentEdit = () => {
		setEditingComment({ postId: '', commentId: '', text: '' });
	};

	const handleSaveCommentEdit = async (postId, commentId) => {
		const trimmedText = editingComment.text.trim();
		if (!trimmedText) {
			setError('Comment text is required.');
			return;
		}

		if (!commentId) {
			setError('Unable to modify this comment.');
			return;
		}

		try {
			setSavingCommentEditKey(`${postId}:${commentId}`);
			setError('');
			const updatedPost = await communityService.updateComment(postId, commentId, { text: trimmedText });
			setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
			handleCancelCommentEdit();
		} catch (err) {
			setError(err.message || 'Unable to modify comment.');
		} finally {
			setSavingCommentEditKey('');
		}
	};

	const handlePostReaction = (post, reaction) => {
		let applied = false;
		setPostReactions((prev) => {
			const current = prev[post._id];
			const result = applyDualReaction(current, reaction === 'like' ? 'positive' : 'negative', 'likes', 'dislikes');
			applied = result.applied;
			return { ...prev, [post._id]: result.state };
		});

		if (applied) {
			pushNotification({
				action: `${reaction === 'like' ? 'liked' : 'disliked'} your post`,
				preview: post.title,
			});
		}
	};

	const handleCommentReaction = (postId, comment, reaction) => {
		const key = getCommentKey(postId, comment);
		let applied = false;
		setCommentReactions((prev) => {
			const current = prev[key];
			const result = applyDualReaction(current, reaction === 'like' ? 'positive' : 'negative', 'likes', 'dislikes');
			applied = result.applied;
			return { ...prev, [key]: result.state };
		});

		if (applied) {
			pushNotification({
				action: `${reaction === 'like' ? 'liked' : 'disliked'} your comment`,
				preview: comment.text?.length > 110 ? `${comment.text.slice(0, 110)}...` : comment.text,
			});
		}
	};

	const getFilteredComments = (comments, postId) => {
		if (!Array.isArray(comments)) return [];
		const filter = filterType[postId];
		if (!filter || filter === 'all') return comments;
		return comments.filter((comment) => (comment.type || 'discussion') === filter);
	};

	const getPostReaction = (postId) => postReactions[postId] || { likes: 0, dislikes: 0, userReaction: null };
	const getCommentReaction = (postId, comment) => commentReactions[getCommentKey(postId, comment)] || { likes: 0, dislikes: 0, userReaction: null };

	const getProblemCommentVote = (postId, comment) => {
		const key = getCommentKey(postId, comment);
		return problemCommentVotes[key] || { votes: 0, unvotes: 0, userReaction: null };
	};

	const handleProblemCommentVote = (postId, comment, type) => {
		const key = getCommentKey(postId, comment);
		setProblemCommentVotes((prev) => {
			const current = prev[key];
			const result = applyDualReaction(current, type === 'vote' ? 'positive' : 'negative', 'votes', 'unvotes');
			return { ...prev, [key]: result.state };
		});
	};

	const openShareModal = (post) => {
		setShareModal({ isOpen: true, postId: post._id, postTitle: post.title });
	};

	const closeShareModal = () => {
		setShareModal({ isOpen: false, postId: '', postTitle: '' });
	};

	const handleShare = (platform) => {
		const canonicalUrl = `${window.location.origin}/community?post=${shareModal.postId}`;
		const text = `Check out "${shareModal.postTitle}" in AlgoArena Community`;
		const encodedText = encodeURIComponent(text);
		const encodedUrl = encodeURIComponent(canonicalUrl);

		if (platform === 'facebook') {
			window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
		} else if (platform === 'reddit') {
			window.open(`https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`, '_blank', 'width=600,height=400');
		}

		closeShareModal();
	};

	return (
		<MotionBox
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.35 }}
			minH="100vh"
			pt={{ base: 24, md: 28 }}
			pb={{ base: 10, md: 16 }}
			px={{ base: 4, sm: 6, lg: 8 }}
			bg="#0f172a"
			bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
			bgSize="50px 50px"
		>
			<Box maxW="7xl" mx="auto">
				<Flex
					direction={{ base: 'column', md: 'row' }}
					align={{ base: 'start', md: 'center' }}
					justify="space-between"
					gap={4}
					mb={6}
				>
					<Box>
						<Text fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color="white">
							Community Discussions
						</Text>
						<Text mt={2} color="gray.400" fontFamily="body">
							Ask questions, share ideas, and collaborate with other AlgoArena members.
						</Text>
					</Box>

					<HStack spacing={3} w={{ base: 'full', md: 'auto' }} align="center">
						<Text color="gray.400" fontSize="sm">Sort:</Text>
						<Select
							value={sortOrder}
							onChange={(e) => setSortOrder(e.target.value)}
							bg="#1e293b"
							borderColor="gray.700"
							color="gray.100"
							size="sm"
							w="160px"
							_hover={{ borderColor: 'brand.500' }}
							_focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
						>
							<option value="latest" style={{ backgroundColor: '#1e293b' }}>Latest First</option>
							<option value="oldest" style={{ backgroundColor: '#1e293b' }}>Oldest First</option>
						</Select>

						<Button
							leftIcon={<PlusIcon width={16} height={16} />}
							variant="primary"
							onClick={() => setIsCreateModalOpen(true)}
							isDisabled={!isLoggedIn}
						>
							{activeSection === 'problems' ? 'Create Problem' : 'Create New Post'}
						</Button>

						<Box position="relative" ref={notificationRef}>
							<IconButton
								aria-label="Notifications"
								icon={<BellIcon width={18} height={18} />}
								variant="ghost"
								border="1px solid"
								borderColor="rgba(34, 211, 238, 0.35)"
								color="gray.100"
								_hover={{
									bg: 'rgba(34, 211, 238, 0.1)',
									borderColor: 'brand.500',
									transform: 'translateY(-1px)',
								}}
								transition="all 0.2s ease"
								onClick={toggleNotifications}
							/>
							{unreadNotifications > 0 && (
								<Badge
									position="absolute"
									top="-1"
									right="-1"
									minW="18px"
									h="18px"
									borderRadius="full"
									bg="red.400"
									color="white"
									display="flex"
									alignItems="center"
									justifyContent="center"
									fontSize="10px"
									border="1px solid #0f172a"
								>
									{Math.min(unreadNotifications, 99)}
								</Badge>
							)}

							{isNotificationOpen && (
								<MotionBox
									initial={{ opacity: 0, y: -8, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ duration: 0.18 }}
									position="absolute"
									top="46px"
									right="0"
									w={{ base: '300px', sm: '360px' }}
									zIndex={40}
									bg="#1e293b"
									border="1px solid rgba(34, 211, 238, 0.2)"
									borderRadius="12px"
									boxShadow="0 12px 30px rgba(2, 6, 23, 0.55)"
									overflow="hidden"
								>
									<Flex px={4} py={3} align="center" justify="space-between" borderBottom="1px solid rgba(148, 163, 184, 0.2)">
										<Text color="white" fontFamily="heading" fontSize="sm">Notifications</Text>
										<Text color="gray.400" fontSize="xs">{notifications.length}</Text>
									</Flex>
									<VStack align="stretch" spacing={0} maxH="360px" overflowY="auto">
										{notifications.length === 0 ? (
											<Text color="gray.500" fontSize="sm" p={4}>No notifications yet.</Text>
										) : (
											notifications.map((item) => (
												<Box
													key={item.id}
													px={4}
													py={3}
													borderBottom="1px solid rgba(148, 163, 184, 0.12)"
													bg={item.read ? 'transparent' : 'rgba(34, 211, 238, 0.06)'}
													transition="background 0.2s ease"
												>
													<HStack align="start" spacing={3}>
														<Avatar size="sm" src={item.actorAvatar || undefined} name={item.actorName} />
														<Box flex="1">
															<Text color="gray.200" fontSize="sm" lineHeight="1.25rem">
																<Text as="span" color="brand.400" fontWeight="semibold">{item.actorName}</Text> {item.action}
															</Text>
															{item.preview && (
																<Text mt={1} color="gray.400" fontSize="xs" noOfLines={2}>
																	"{item.preview}"
																</Text>
															)}
															<Text mt={1} color="gray.500" fontSize="xs">
																{formatDateTime(item.createdAt)}
															</Text>
														</Box>
													</HStack>
												</Box>
											))
										)}
									</VStack>
								</MotionBox>
							)}
						</Box>
					</HStack>
				</Flex>

				<HStack spacing={3} mb={6}>
					<Button
						size="sm"
						variant={activeSection === 'community' ? 'solid' : 'outline'}
						colorScheme="cyan"
						onClick={() => setActiveSection('community')}
						transition="all 0.2s ease"
					>
						Community
					</Button>
					<Button
						size="sm"
						variant={activeSection === 'problems' ? 'solid' : 'outline'}
						colorScheme="cyan"
						onClick={() => setActiveSection('problems')}
						transition="all 0.2s ease"
					>
						Problems
					</Button>
				</HStack>

				{error && (
					<Box
						mb={6}
						bg="rgba(239, 68, 68, 0.12)"
						border="1px solid rgba(239, 68, 68, 0.4)"
						borderRadius="12px"
						px={4}
						py={3}
					>
						<Text color="red.300" fontSize="sm">{error}</Text>
					</Box>
				)}

				<MotionBox key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
					{loading ? (
						<Flex justify="center" py={14}>
							<Spinner size="lg" color="brand.500" thickness="3px" />
						</Flex>
					) : (
						<VStack spacing={4} align="stretch">
							{sectionPosts.length === 0 ? (
								<Box
									bg="#1e293b"
									border="1px solid"
									borderColor="gray.700"
									borderRadius="14px"
									p={7}
									textAlign="center"
								>
									<Text color="gray.300" fontSize="lg" fontFamily="heading">
										{activeSection === 'problems' ? 'No problems yet.' : 'No discussions yet.'}
									</Text>
									<Text color="gray.500" mt={2}>
										{activeSection === 'problems'
											? 'Create the first problem to get help from the community.'
											: 'Start the first conversation with your community.'}
									</Text>
								</Box>
							) : (
								sectionPosts.map((post) => {
									const postId = post._id;
									const expanded = Boolean(expandedPostIds[postId]);
									const allComments = Array.isArray(post.comments) ? post.comments : [];
									const filteredComments = activeSection === 'problems' ? allComments : getFilteredComments(allComments, postId);
									const postReaction = getPostReaction(postId);
									const isEditingPost = editingPost.postId === postId;

									return (
										<Box
											key={postId}
											maxW={{ base: '100%', md: '86%', lg: '56%' }}
											mx="auto"
											w="full"
											bg="#1e293b"
											border="1px solid"
											borderColor="rgba(34, 211, 238, 0.12)"
											borderRadius="14px"
											p={{ base: 3, md: 4 }}
											transition="all 0.25s ease"
											_hover={{
												borderColor: 'rgba(34, 211, 238, 0.45)',
												boxShadow: '0 8px 24px rgba(34, 211, 238, 0.15)',
												transform: 'translateY(-2px)',
											}}
										>
											<Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
												<Box flex="1">
													{!isEditingPost ? (
														<>
															<Flex align="center" gap={2} mb={1}>
																<Text color="white" fontFamily="heading" fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
																	{post.title}
																</Text>
																{post.type && (
																	<Badge
																		colorScheme={post.type === 'strategy' ? 'purple' : post.type === 'discussion' ? 'blue' : post.type === 'problem' ? 'orange' : 'cyan'}
																		variant="subtle"
																		px={2}
																		py={1}
																		borderRadius="md"
																		fontSize="xs"
																	>
																		{post.type}
																	</Badge>
																)}
															</Flex>
															<HStack spacing={2} mt={1} flexWrap="wrap">
																<Badge colorScheme="cyan" variant="subtle" px={2} py={1} borderRadius="md">
																	@{post.authorUsername || 'unknown'}
																</Badge>
																<Text color="gray.500" fontSize="xs">
																	{formatDateTime(post.createdAt)}
																</Text>
																<Text color="gray.500" fontSize="xs">
																	{allComments.length} {allComments.length === 1 ? 'comment' : 'comments'}
																</Text>
															</HStack>
														</>
													) : (
														<VStack align="stretch" spacing={2}>
															<Input
																value={editingPost.title}
																onChange={(e) => setEditingPost((prev) => ({ ...prev, title: e.target.value }))}
																bg="#0f172a"
																borderColor="gray.700"
																color="gray.100"
															/>
															<Textarea
																value={editingPost.content}
																onChange={(e) => setEditingPost((prev) => ({ ...prev, content: e.target.value }))}
																minH="110px"
																bg="#0f172a"
																borderColor="gray.700"
																color="gray.100"
															/>
														</VStack>
													)}
												</Box>

												<HStack spacing={2} alignSelf={{ base: 'stretch', md: 'center' }}>
													{!isEditingPost ? (
														<>
															<Button
																size="xs"
																variant="ghost"
																onClick={() => togglePostExpanded(postId)}
																borderColor="rgba(34, 211, 238, 0.35)"
																border="1px solid"
															>
																{expanded ? 'Hide' : 'View'}
															</Button>
															<Button
																size="xs"
																variant="ghost"
																leftIcon={<ShareIcon width={12} height={12} />}
																onClick={() => openShareModal(post)}
																borderColor="rgba(34, 211, 238, 0.35)"
																border="1px solid"
															>
																Share
															</Button>
															{isOwner(post.authorId) && (
																<Button
																	size="xs"
																	variant="ghost"
																	borderColor="rgba(34, 211, 238, 0.35)"
																	border="1px solid"
																	onClick={() => handleStartPostEdit(post)}
																>
																	Modify
																</Button>
															)}
														</>
													) : (
														<>
															<Button
																size="xs"
																variant="ghost"
																onClick={handleCancelPostEdit}
															>
																Cancel
															</Button>
															<Button
																size="xs"
																variant="primary"
																isLoading={savingPostEditId === postId}
																onClick={() => handleSavePostEdit(postId)}
															>
																Save
															</Button>
														</>
													)}
												</HStack>
											</Flex>

											{!isEditingPost && (
												<>
													{post.imageUrl && activeSection !== 'problems' && (
														<Box
															mt={3}
															w="full"
															h="170px"
															borderRadius="8px"
															overflow="hidden"
															bg="rgba(0, 0, 0, 0.3)"
															border="1px solid rgba(34, 211, 238, 0.2)"
														>
															<Box
																w="full"
																h="full"
																backgroundImage={`url(${post.imageUrl})`}
																backgroundPosition="center"
																backgroundSize="cover"
															/>
														</Box>
													)}

													{post.videoUrl && activeSection !== 'problems' && (
														<Box mt={3} borderRadius="8px" overflow="hidden" border="1px solid rgba(34, 211, 238, 0.2)">
															<video
																src={post.videoUrl}
																controls
																style={{ width: '100%', maxHeight: '200px', background: '#020617' }}
															/>
														</Box>
													)}

													<Text mt={3} color="gray.200" whiteSpace="pre-wrap" fontSize="sm">
														{expanded || activeSection === 'problems' ? post.content : previewContent(post.content)}
													</Text>

													{activeSection === 'community' && (
														<HStack spacing={2} mt={3}>
															<Button
																size="xs"
																variant={postReaction.userReaction === 'positive' ? 'solid' : 'ghost'}
																colorScheme="cyan"
																leftIcon={<ThumbUpIcon width={12} height={12} />}
																onClick={() => handlePostReaction(post, 'like')}
																_hover={{ transform: 'translateY(-1px)' }}
																transition="all 0.2s ease"
															>
																{postReaction.likes}
															</Button>
															<Button
																size="xs"
																variant={postReaction.userReaction === 'negative' ? 'solid' : 'ghost'}
																colorScheme="red"
																leftIcon={<ThumbDownIcon width={12} height={12} />}
																onClick={() => handlePostReaction(post, 'dislike')}
																_hover={{ transform: 'translateY(-1px)' }}
																transition="all 0.2s ease"
															>
																{postReaction.dislikes}
															</Button>
														</HStack>
													)}
												</>
											)}

											<Divider my={3} borderColor="rgba(148, 163, 184, 0.25)" />

											<VStack align="stretch" spacing={3}>
												{activeSection === 'community' && allComments.length > 0 && (
													<HStack spacing={2} flexWrap="wrap">
														<Text color="gray.400" fontSize="xs" fontWeight="semibold">Filter:</Text>
														<Button
															size="xs"
															variant={!filterType[postId] || filterType[postId] === 'all' ? 'solid' : 'outline'}
															colorScheme="cyan"
															onClick={() => setFilterType((prev) => ({ ...prev, [postId]: 'all' }))}
														>
															All ({allComments.length})
														</Button>
														<Button
															size="xs"
															variant={filterType[postId] === 'discussion' ? 'solid' : 'outline'}
															colorScheme="blue"
															onClick={() => setFilterType((prev) => ({ ...prev, [postId]: 'discussion' }))}
														>
															Discussion ({allComments.filter((c) => (c.type || 'discussion') === 'discussion').length})
														</Button>
														<Button
															size="xs"
															variant={filterType[postId] === 'strategy' ? 'solid' : 'outline'}
															colorScheme="purple"
															onClick={() => setFilterType((prev) => ({ ...prev, [postId]: 'strategy' }))}
														>
															Strategy ({allComments.filter((c) => c.type === 'strategy').length})
														</Button>
													</HStack>
												)}

												{filteredComments.length === 0 ? (
													<Text color="gray.500" fontSize="sm">
														No comments yet.
													</Text>
												) : (
													filteredComments.map((comment) => {
														const isEditingComment =
															editingComment.postId === postId &&
															editingComment.commentId &&
															editingComment.commentId === (comment._id || '');
														const commentReaction = getCommentReaction(postId, comment);
														const problemVote = getProblemCommentVote(postId, comment);

														return (
															<Box
																key={comment._id || `${postId}-${comment.createdAt}`}
																bg="#0f172a"
																border="1px solid"
																borderColor="rgba(148, 163, 184, 0.22)"
																borderRadius="10px"
																p={2.5}
															>
																<Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2}>
																	<HStack spacing={2}>
																		<Text color="brand.500" fontWeight="semibold" fontSize="sm">
																			@{comment.authorUsername || 'unknown'}
																		</Text>
																		{activeSection === 'community' && (
																			<Badge
																				colorScheme={(comment.type || 'discussion') === 'strategy' ? 'purple' : 'blue'}
																				variant="subtle"
																				px={1.5}
																				py={0.5}
																				borderRadius="sm"
																				fontSize="xs"
																			>
																				{comment.type || 'discussion'}
																			</Badge>
																		)}
																	</HStack>
																	<HStack spacing={2}>
																		<Text color="gray.500" fontSize="xs">
																			{formatDateTime(comment.createdAt)}
																		</Text>
																		{isOwner(comment.authorId) && comment._id && (
																			<Button
																				size="xs"
																				variant="ghost"
																				border="1px solid"
																				borderColor="rgba(34, 211, 238, 0.35)"
																				onClick={() => handleStartCommentEdit(postId, comment)}
																			>
																				Modify
																			</Button>
																		)}
																	</HStack>
																</Flex>

																{!isEditingComment ? (
																	<Text mt={2} color="gray.200" fontSize="sm" whiteSpace="pre-wrap">
																		{comment.text}
																	</Text>
																) : (
																	<VStack align="stretch" spacing={2} mt={2}>
																		<Textarea
																			value={editingComment.text}
																			onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
																			minH="80px"
																			bg="#0b1220"
																			borderColor="gray.700"
																			color="gray.100"
																		/>
																		<HStack justify="flex-end">
																			<Button size="xs" variant="ghost" onClick={handleCancelCommentEdit}>Cancel</Button>
																			<Button
																				size="xs"
																				variant="primary"
																				isLoading={savingCommentEditKey === `${postId}:${comment._id}`}
																				onClick={() => handleSaveCommentEdit(postId, comment._id)}
																			>
																				Save
																			</Button>
																		</HStack>
																	</VStack>
																)}

																{!isEditingComment && (
																	<HStack spacing={2} mt={2}>
																		{activeSection === 'community' ? (
																			<>
																				<Button
																					size="xs"
																					variant={commentReaction.userReaction === 'positive' ? 'solid' : 'ghost'}
																					colorScheme="cyan"
																					leftIcon={<ThumbUpIcon width={11} height={11} />}
																					onClick={() => handleCommentReaction(postId, comment, 'like')}
																					_hover={{ transform: 'translateY(-1px)' }}
																					transition="all 0.2s ease"
																				>
																					{commentReaction.likes}
																				</Button>
																				<Button
																					size="xs"
																					variant={commentReaction.userReaction === 'negative' ? 'solid' : 'ghost'}
																					colorScheme="red"
																					leftIcon={<ThumbDownIcon width={11} height={11} />}
																					onClick={() => handleCommentReaction(postId, comment, 'dislike')}
																					_hover={{ transform: 'translateY(-1px)' }}
																					transition="all 0.2s ease"
																				>
																					{commentReaction.dislikes}
																				</Button>
																			</>
																		) : (
																			<>
																				<Button
																					size="xs"
																					variant={problemVote.userReaction === 'positive' ? 'solid' : 'ghost'}
																					colorScheme="cyan"
																					onClick={() => handleProblemCommentVote(postId, comment, 'vote')}
																					_hover={{ transform: 'translateY(-1px)' }}
																					transition="all 0.2s ease"
																				>
																					Vote {problemVote.votes}
																				</Button>
																				<Button
																					size="xs"
																					variant={problemVote.userReaction === 'negative' ? 'solid' : 'ghost'}
																					colorScheme="red"
																					onClick={() => handleProblemCommentVote(postId, comment, 'unvote')}
																					_hover={{ transform: 'translateY(-1px)' }}
																					transition="all 0.2s ease"
																				>
																					Unvote {problemVote.unvotes}
																				</Button>
																			</>
																		)}
																	</HStack>
																)}
															</Box>
														);
													})
												)}
											</VStack>

											<Box as="form" mt={3} onSubmit={(event) => handleAddComment(event, postId)}>
												<FormControl isInvalid={Boolean(commentErrors[postId])}>
													<VStack align="stretch" spacing={3}>
														{activeSection === 'community' && (
															<RadioGroup
																value={commentType[postId] || 'discussion'}
																onChange={(value) => setCommentType((prev) => ({ ...prev, [postId]: value }))}
																isDisabled={!isLoggedIn}
															>
																<HStack spacing={4}>
																	<Text color="gray.400" fontSize="xs">Type:</Text>
																	<Radio value="discussion" colorScheme="blue" size="sm">
																		<Text color="gray.200" fontSize="xs">Discussion</Text>
																	</Radio>
																	<Radio value="strategy" colorScheme="purple" size="sm">
																		<Text color="gray.200" fontSize="xs">Strategy</Text>
																	</Radio>
																</HStack>
															</RadioGroup>
														)}

														<HStack align="start" spacing={3}>
															<Textarea
																value={commentInputs[postId] || ''}
																onChange={(e) => handleCommentInputChange(postId, e.target.value)}
																placeholder={isLoggedIn ? 'Write a comment...' : 'Sign in to write a comment...'}
																minH="60px"
																resize="vertical"
																bg="#0f172a"
																borderColor="gray.700"
																color="gray.100"
																_hover={{ borderColor: 'brand.500' }}
																_focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
																isDisabled={!isLoggedIn}
															/>
															<Button
																type="submit"
																variant="primary"
																isLoading={commentingPostId === postId}
																loadingText="Sending"
																isDisabled={!isLoggedIn}
																alignSelf="stretch"
															>
																Comment
															</Button>
														</HStack>
														<FormErrorMessage>{commentErrors[postId]}</FormErrorMessage>
													</VStack>
												</FormControl>
											</Box>
										</Box>
									);
								})
							)}
						</VStack>
					)}
				</MotionBox>
			</Box>

			<Modal isOpen={isCreateModalOpen} onClose={handleCreateModalClose} size="lg" isCentered>
				<ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
				<ModalContent bg="#1e293b" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="16px">
					<ModalHeader color="white" fontFamily="heading" fontSize="xl" fontWeight="semibold">
						{activeSection === 'problems' ? 'Create Problem' : 'Create New Post'}
					</ModalHeader>
					<ModalCloseButton color="gray.400" _hover={{ color: 'brand.500' }} />
					<ModalBody pb={6}>
						<form onSubmit={handleCreatePost}>
							<VStack spacing={4} align="stretch">
								<FormControl isInvalid={Boolean(postErrors.title)} isRequired>
									<FormLabel color="gray.300" fontSize="sm">Title</FormLabel>
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder={activeSection === 'problems' ? 'Write a clear problem title' : 'Write a clear title'}
										bg="#0f172a"
										borderColor="gray.700"
										color="gray.100"
										_hover={{ borderColor: 'brand.500' }}
										_focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
									/>
									<FormErrorMessage>{postErrors.title}</FormErrorMessage>
								</FormControl>

								<FormControl isInvalid={Boolean(postErrors.content)} isRequired>
									<FormLabel color="gray.300" fontSize="sm">
										{activeSection === 'problems' ? 'Description' : 'Content'}
									</FormLabel>
									<Textarea
										value={content}
										onChange={(e) => setContent(e.target.value)}
										placeholder={activeSection === 'problems' ? 'Describe your issue or question' : 'Describe your idea, question, or issue'}
										minH="150px"
										resize="vertical"
										bg="#0f172a"
										borderColor="gray.700"
										color="gray.100"
										_hover={{ borderColor: 'brand.500' }}
										_focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
									/>
									<FormErrorMessage>{postErrors.content}</FormErrorMessage>
								</FormControl>

								{activeSection === 'community' && (
									<>
										<FormControl>
											<FormLabel color="gray.300" fontSize="sm">Post Type</FormLabel>
											<RadioGroup value={postType} onChange={setPostType}>
												<Stack spacing={2} direction={{ base: 'column', sm: 'row' }}>
													<Radio value="normal" colorScheme="cyan">Normal</Radio>
													<Radio value="discussion" colorScheme="blue">Discussion</Radio>
													<Radio value="strategy" colorScheme="purple">Strategy</Radio>
												</Stack>
											</RadioGroup>
										</FormControl>

										<FormControl>
											<FormLabel color="gray.300" fontSize="sm">Image (optional)</FormLabel>
											<Button
												as="label"
												leftIcon={<ImageIcon width={16} height={16} />}
												variant="outline"
												borderColor="brand.500"
												color="brand.300"
												_hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
												cursor="pointer"
												w="full"
											>
												{imageFile ? 'Change Image' : 'Add Image'}
												<Input type="file" accept="image/*" onChange={handleImageSelect} hidden />
											</Button>
											{imageFile && (
												<Box mt={2}>
													<Text color="gray.400" fontSize="xs">{imageFile.name}</Text>
													{imagePreviewUrl && (
														<Box
															mt={2}
															w="full"
															h="140px"
															borderRadius="8px"
															border="1px solid rgba(34, 211, 238, 0.2)"
															backgroundImage={`url(${imagePreviewUrl})`}
															backgroundSize="cover"
															backgroundPosition="center"
														/>
													)}
												</Box>
											)}
										</FormControl>

										<FormControl>
											<FormLabel color="gray.300" fontSize="sm">Video (optional)</FormLabel>
											<Button
												as="label"
												leftIcon={<VideoIcon width={16} height={16} />}
												variant="outline"
												borderColor="brand.500"
												color="brand.300"
												_hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
												cursor="pointer"
												w="full"
											>
												{videoFile ? 'Change Video' : 'Add Video'}
												<Input type="file" accept="video/*" onChange={handleVideoSelect} hidden />
											</Button>
											{videoFile && (
												<Text mt={2} color="gray.400" fontSize="xs">{videoFile.name}</Text>
											)}
										</FormControl>
									</>
								)}

								<Flex justify="flex-end" gap={3} pt={2}>
									<Button
										variant="ghost"
										onClick={handleCreateModalClose}
										color="gray.300"
										_hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="primary"
										isLoading={creatingPost}
										loadingText="Posting"
									>
										Publish
									</Button>
								</Flex>
							</VStack>
						</form>
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal isOpen={shareModal.isOpen} onClose={closeShareModal} size="md" isCentered>
				<ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
				<ModalContent bg="#1e293b" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="16px">
					<ModalHeader color="white" fontFamily="heading" fontSize="lg" fontWeight="semibold">
						Share Discussion
					</ModalHeader>
					<ModalCloseButton color="gray.400" _hover={{ color: 'brand.500' }} />
					<ModalBody pb={6}>
						<VStack spacing={4} align="stretch">
							<Text color="gray.300" fontSize="sm">
								Share "{shareModal.postTitle}" on:
							</Text>

							<HStack spacing={3}>
								<Button
									leftIcon={<ShareIcon width={14} height={14} />}
									onClick={() => handleShare('facebook')}
									bg="rgba(66, 103, 178, 0.8)"
									color="white"
									_hover={{ bg: 'rgba(66, 103, 178, 1)' }}
								>
									Facebook
								</Button>
								<Button
									leftIcon={<ShareIcon width={14} height={14} />}
									onClick={() => handleShare('reddit')}
									bg="rgba(255, 69, 0, 0.8)"
									color="white"
									_hover={{ bg: 'rgba(255, 69, 0, 1)' }}
								>
									Reddit
								</Button>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</MotionBox>
	);
};

export default CommunityPage;
