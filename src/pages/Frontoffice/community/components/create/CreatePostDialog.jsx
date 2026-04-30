import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react';
import { communityService } from '../../../../../services/communityService';
import { useAITags } from '../../hooks/useAITags';
import { uploadMediaAndGetUrl } from '../../utils/media';
import { parseTags, normalizeTagList } from '../../utils/tags';
import Tag from '../shared/Tag';
import { ImageIcon, SparkleIcon, VideoIcon } from '../shared/icons';

// Minimal-but-functional create-post dialog. Polished UX (file previews,
// drag&drop, debounced AI tag fetch on blur) lands in step 4. The
// behaviour matches the legacy monolith so submitted posts are identical.
const CreatePostDialog = ({
  isOpen,
  onClose,
  defaultSection = 'discussion',
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [problemType, setProblemType] = useState('bug');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const {
    suggestedTags,
    isFetching: isFetchingAi,
    error: aiError,
    requestTags,
    reset: resetAi,
  } = useAITags();

  const isProblem = defaultSection === 'problems';
  const parsedTags = useMemo(() => parseTags(tagsInput), [tagsInput]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setProblemType('bug');
      setTagsInput('');
      setImageFile(null);
      setVideoFile(null);
      setImagePreviewUrl('');
      setVideoPreviewUrl('');
      setSubmitting(false);
      setErrors({});
      setSubmitError('');
      resetAi();
    }
  }, [isOpen, resetAi]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSuggestTags = () => {
    const text = `${title}\n\n${content}`.trim();
    void requestTags(text);
  };

  const toggleSuggestedTag = (tag) => {
    if (parsedTags.includes(tag)) {
      setTagsInput(parsedTags.filter((t) => t !== tag).join(', '));
    } else {
      setTagsInput(normalizeTagList([...parsedTags, tag]).join(', '));
    }
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Title is required.';
    if (!content.trim()) {
      next.content = isProblem
        ? 'Description is required.'
        : 'Content is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setSubmitError('');

      const imageUrl = await uploadMediaAndGetUrl(imageFile);
      const videoUrl = await uploadMediaAndGetUrl(videoFile);

      const newPost = {
        title: title.trim(),
        content: content.trim(),
        type: isProblem ? 'problem' : 'normal',
        problemType: isProblem ? problemType : undefined,
        tags: parsedTags,
        imageUrl,
        videoUrl,
      };

      const saved = await communityService.createPost(newPost);
      onCreated?.(saved);
      onClose();
    } catch (err) {
      setSubmitError(err?.message || 'Unable to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.700" />
      <ModalContent
        bg="var(--color-bg-secondary)"
        border="1px solid"
        borderColor="var(--cmty-card-ring)"
      >
        <ModalHeader className="!text-[var(--color-text-heading)] !font-semibold !text-lg">
          {isProblem ? 'Report a problem' : 'Start a discussion'}
        </ModalHeader>
        <ModalCloseButton className="!text-[var(--color-text-muted)] hover:!text-[var(--color-text-heading)]" />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] font-medium block mb-1">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A short, descriptive headline"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)] placeholder:text-[var(--cmty-text-subtle)]"
                  maxLength={140}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.title}</p>
                )}
              </div>

              {isProblem && (
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] font-medium block mb-1">
                    Problem type
                  </label>
                  <select
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)] cursor-pointer"
                  >
                    <option value="bug">Bug</option>
                    <option value="feature">Feature request</option>
                    <option value="question">Question</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-[var(--color-text-muted)] font-medium block mb-1">
                  {isProblem ? 'Description' : 'Content'}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isProblem
                      ? 'Steps to reproduce, expected vs actual behaviour...'
                      : 'Share your thoughts. Markdown links are supported.'
                  }
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)] placeholder:text-[var(--cmty-text-subtle)] resize-y min-h-[8rem]"
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.content}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--color-text-muted)] font-medium">
                    Tags
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestTags}
                    disabled={isFetchingAi}
                    className="inline-flex items-center gap-1 text-xs text-[var(--cmty-active-text)] hover:opacity-80 disabled:opacity-50"
                  >
                    {isFetchingAi ? (
                      <Spinner size="xs" />
                    ) : (
                      <SparkleIcon size={12} />
                    )}
                    {isFetchingAi ? 'Generating…' : 'Suggest with AI'}
                  </button>
                </div>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="comma, separated, tags"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)] placeholder:text-[var(--cmty-text-subtle)]"
                />
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedTags.map((tag) => (
                      <Tag key={tag} active size="xs">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
                {suggestedTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--cmty-text-subtle)] mb-1">
                      AI suggestions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTags.map((tag) => (
                        <Tag
                          key={tag}
                          interactive
                          active={parsedTags.includes(tag)}
                          onClick={() => toggleSuggestedTag(tag)}
                          size="xs"
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                {aiError && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{aiError}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] hover:bg-[var(--cmty-card-bg-hover)] cursor-pointer text-xs text-[var(--color-text-secondary)]">
                  <ImageIcon size={14} />
                  <span>{imageFile ? imageFile.name.slice(0, 24) : 'Add image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] hover:bg-[var(--cmty-card-bg-hover)] cursor-pointer text-xs text-[var(--color-text-secondary)]">
                  <VideoIcon size={14} />
                  <span>{videoFile ? videoFile.name.slice(0, 24) : 'Add video'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {(imagePreviewUrl || videoPreviewUrl) && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full max-h-40 object-cover rounded-lg ring-1 ring-[var(--cmty-card-ring)]"
                    />
                  )}
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-40 rounded-lg ring-1 ring-[var(--cmty-card-ring)]"
                    />
                  )}
                </div>
              )}

              {submitError && (
                <p className="text-sm text-rose-700 dark:text-rose-300 bg-rose-500/10 ring-1 ring-rose-400/30 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="!gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              isDisabled={submitting}
              className="!text-[var(--color-text-secondary)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              loadingText="Posting"
              className="!bg-cyan-400 !text-slate-950 hover:!bg-cyan-300 !font-semibold"
            >
              Publish
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreatePostDialog;
