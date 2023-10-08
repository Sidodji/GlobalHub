﻿namespace BudgetsService.DataAccess.EntityConfigurations.Base;

public class BaseEntityTypeConfiguration<T> : IEntityTypeConfiguration<T>
    where T : BaseEntity
{
    public void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(e => e.Id);
    }
}
