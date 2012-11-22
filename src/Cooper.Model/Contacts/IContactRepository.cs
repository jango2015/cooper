﻿//Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/

using System;
using System.Collections.Generic;
using CodeSharp.Core.RepositoryFramework;
using Cooper.Model.Contacts;

namespace Cooper.Model.Contacts
{
    /// <summary>
    /// 联系人仓储
    /// </summary>
    public interface IContactRepository : IRepository<Guid, Contact>
    {
        IEnumerable<Contact> FindBy(AddressBook addressBook);
    }
}