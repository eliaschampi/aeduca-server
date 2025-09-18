-- =====================================================
-- MIGRATION: MongoDB to PostgreSQL for Posts and Comments
-- =====================================================

-- Create post table
CREATE TABLE IF NOT EXISTS public.post (
    code SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    commentable BOOLEAN DEFAULT true,
    link VARCHAR(500),
    likes TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of user DNIs who liked
    creator_dni CHAR(8) NOT NULL,
    creator_name VARCHAR(130) NOT NULL, -- Concatenated full name
    creator_image VARCHAR(100),
    share_with TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of section codes or 'all', 'pri', 'sec'
    savelist TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of user DNIs who saved
    files JSON, -- Array of attached files
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_creator FOREIGN KEY (creator_dni) REFERENCES public.person(dni) ON DELETE CASCADE
);

-- Create comment table  
CREATE TABLE IF NOT EXISTS public.comment (
    code SERIAL PRIMARY KEY,
    post_code INTEGER NOT NULL,
    from_dni CHAR(8) NOT NULL,
    from_name VARCHAR(130) NOT NULL, -- Concatenated full name
    from_image VARCHAR(100),
    message TEXT NOT NULL,
    attached JSON, -- Single attached file
    reply_to_code INTEGER, -- Code of comment being replied to
    content_type VARCHAR(50) DEFAULT 'text',
    url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_code) REFERENCES public.post(code) ON DELETE CASCADE,
    CONSTRAINT fk_comment_from FOREIGN KEY (from_dni) REFERENCES public.person(dni) ON DELETE CASCADE,
    CONSTRAINT fk_comment_reply FOREIGN KEY (reply_to_code) REFERENCES public.comment(code) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_post_creator_dni ON public.post(creator_dni);
CREATE INDEX idx_post_created_at ON public.post(created_at DESC);
CREATE INDEX idx_post_approved ON public.post(approved);
CREATE INDEX idx_post_share_with ON public.post USING GIN (share_with);

CREATE INDEX idx_comment_post_code ON public.comment(post_code);
CREATE INDEX idx_comment_from_dni ON public.comment(from_dni);
CREATE INDEX idx_comment_created_at ON public.comment(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON public.post
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comment_updated_at BEFORE UPDATE ON public.comment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
