-- Discard the one legacy OCR draft explicitly approved by the owner.
-- Keep its upload accounting; all new drafts are stored only on devices.
UPDATE imports SET result = NULL WHERE id = '72ec24a2-fb43-4f1b-a0df-d3ed49caf3e7';
