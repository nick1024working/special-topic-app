-- 書本無圖片
select b.id, b.title, b.SellerId
from UsedBooks as b
where not exists (
	select bi.BookId
	from UsedBookImages as bi
	where bi.BookId = b.id
);
go

-- 書本無促銷標籤
select b.id
from UsedBooks as b
where not exists (
	select st.BookId
	from UsedBookSaleTags as st
	where st.BookId = b.id
);
go

-- 書與標籤
select * from UsedBooks as b
join UsedBookSaleTags as bt
	on b.id = bt.BookId
join BookSaleTags as t
	on t.id = bt.TagId;
go
